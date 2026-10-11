import os
import math
import uuid
import io
import csv
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Query, Header
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import catboost as cb
import shap

from backend.database import (
    init_db,
    save_application,
    get_application_by_id,
    query_applications,
    update_review_status,
    update_manual_override,
    add_review_note,
    get_overview_metrics,
    get_analytics_data,
    get_audit_logs,
    record_audit_log,
    hash_password,
    verify_password,
    get_db_connection
)
from backend.auth import (
    get_current_admin,
    create_admin_session,
    revoke_admin_session,
    authenticate_admin_credentials
)

app = FastAPI(
    title="KnowYourLoan ML & Admin API",
    description="Production CatBoost + SHAP loan prediction, explainability, and secure admin operations service.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model & Explainer Initialization
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "know_your_loan_catboost_model.cbm")
THRESHOLD = 0.45

FEATURE_ORDER = [
    'age', 'gender', 'marital_status', 'dependents', 'education',
    'employment_type', 'employment_years', 'city_tier', 'monthly_income',
    'coapplicant_income', 'other_monthly_income', 'existing_loan_count',
    'existing_emi', 'credit_card_outstanding', 'monthly_expenses',
    'total_outstanding_debt', 'credit_score', 'credit_history_years',
    'active_credit_accounts', 'late_payments_12m', 'previous_defaults',
    'credit_enquiries_6m', 'credit_utilization', 'savings_balance',
    'property_value', 'vehicle_value', 'investment_value', 'loan_amount',
    'loan_tenure_months', 'loan_purpose', 'annual_interest_rate',
    'new_loan_emi', 'total_monthly_debt', 'dti_ratio', 'foir'
]

CATEGORICAL_FEATURES = [
    'gender', 'marital_status', 'education', 'employment_type', 'city_tier', 'loan_purpose'
]

FEATURE_LABELS = {
    'age': 'Age',
    'gender': 'Gender',
    'marital_status': 'Marital Status',
    'dependents': 'Dependents',
    'education': 'Education Level',
    'employment_type': 'Employment Type',
    'employment_years': 'Employment Years',
    'city_tier': 'City Tier',
    'monthly_income': 'Monthly Income',
    'coapplicant_income': 'Co-applicant Income',
    'other_monthly_income': 'Other Monthly Income',
    'existing_loan_count': 'Existing Loan Count',
    'existing_emi': 'Existing EMI',
    'credit_card_outstanding': 'Credit Card Outstanding',
    'monthly_expenses': 'Monthly Expenses',
    'total_outstanding_debt': 'Total Outstanding Debt',
    'credit_score': 'Credit Score (CIBIL)',
    'credit_history_years': 'Credit History Length',
    'active_credit_accounts': 'Active Credit Accounts',
    'late_payments_12m': 'Late Payments (Past 12M)',
    'previous_defaults': 'Previous Defaults',
    'credit_enquiries_6m': 'Credit Enquiries (Past 6M)',
    'credit_utilization': 'Credit Card Utilization',
    'savings_balance': 'Savings Balance',
    'property_value': 'Property Value',
    'vehicle_value': 'Vehicle Value',
    'investment_value': 'Investment Value',
    'loan_amount': 'Requested Loan Amount',
    'loan_tenure_months': 'Loan Tenure (Months)',
    'loan_purpose': 'Loan Purpose',
    'annual_interest_rate': 'Annual Interest Rate (%)',
    'new_loan_emi': 'Calculated New Loan EMI',
    'total_monthly_debt': 'Total Monthly Debt Obligations',
    'dti_ratio': 'Debt-to-Income (DTI) Ratio',
    'foir': 'Fixed Obligation to Income Ratio (FOIR)'
}

model: Optional[cb.CatBoostClassifier] = None
explainer: Optional[shap.TreeExplainer] = None

def load_ml_model():
    global model, explainer
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
    loaded_model = cb.CatBoostClassifier()
    loaded_model.load_model(MODEL_PATH)
    model = loaded_model
    explainer = shap.TreeExplainer(model)
    print(f"CatBoost model successfully loaded from {MODEL_PATH}")
    print(f"Features: {len(model.feature_names_)} columns, Threshold: {THRESHOLD}")

@app.on_event("startup")
def startup_event():
    init_db()
    load_ml_model()

# ---------------------------------------------------------------------------
# Derived Features Computation
# ---------------------------------------------------------------------------
def calculate_derived_features(data: Dict[str, Any]) -> Dict[str, float]:
    loan_amount = float(data.get('loan_amount', 0))
    loan_tenure_months = float(data.get('loan_tenure_months', 1))
    annual_interest_rate = float(data.get('annual_interest_rate', 0))
    existing_emi = float(data.get('existing_emi', 0))
    monthly_income = float(data.get('monthly_income', 0))
    coapplicant_income = float(data.get('coapplicant_income', 0))
    other_monthly_income = float(data.get('other_monthly_income', 0))
    monthly_expenses = float(data.get('monthly_expenses', 0))

    if loan_tenure_months <= 0:
        loan_tenure_months = 12

    monthly_rate = annual_interest_rate / 12.0 / 100.0
    if monthly_rate <= 0:
        new_loan_emi = loan_amount / loan_tenure_months
    else:
        try:
            compound = (1.0 + monthly_rate) ** loan_tenure_months
            if compound == 1.0:
                new_loan_emi = loan_amount / loan_tenure_months
            else:
                new_loan_emi = (loan_amount * monthly_rate * compound) / (compound - 1.0)
        except OverflowError:
            new_loan_emi = loan_amount * monthly_rate

    total_monthly_debt = existing_emi + new_loan_emi
    total_monthly_income = monthly_income + coapplicant_income + other_monthly_income

    if total_monthly_income > 0:
        dti_ratio = total_monthly_debt / total_monthly_income
    else:
        dti_ratio = 1.0

    foir_denominator = total_monthly_income - (monthly_expenses * 0.5)
    if foir_denominator > 0:
        foir = total_monthly_debt / foir_denominator
    else:
        foir = 2.0

    return {
        'new_loan_emi': float(round(new_loan_emi, 2)),
        'total_monthly_debt': float(round(total_monthly_debt, 2)),
        'dti_ratio': float(round(dti_ratio, 4)),
        'foir': float(round(foir, 4)),
        'total_monthly_income': float(round(total_monthly_income, 2))
    }

def prepare_dataframe(data: Dict[str, Any]) -> pd.DataFrame:
    derived = calculate_derived_features(data)
    combined = {**data, **derived}

    # Normalize city_tier formatting if provided as "Tier1" -> "Tier 1"
    raw_city = str(combined.get('city_tier', 'Tier 1')).strip()
    if raw_city == 'Tier1':
        combined['city_tier'] = 'Tier 1'
    elif raw_city == 'Tier2':
        combined['city_tier'] = 'Tier 2'
    elif raw_city == 'Tier3':
        combined['city_tier'] = 'Tier 3'

    row = {}
    for col in FEATURE_ORDER:
        val = combined.get(col)
        if val is None:
            raise ValueError(f"Missing required feature: {col}")
        if col in CATEGORICAL_FEATURES:
            row[col] = str(val)
        else:
            row[col] = float(val)

    df = pd.DataFrame([row])[FEATURE_ORDER]
    for col in CATEGORICAL_FEATURES:
        df[col] = df[col].astype(str)
    return df, derived

def compute_shap_factors(df: pd.DataFrame, max_factors: int = 8) -> Dict[str, Any]:
    global explainer
    if explainer is None:
        raise RuntimeError("SHAP explainer not initialized.")
    shap_res = explainer(df)
    shap_vals = shap_res.values[0]
    base_val = float(explainer.expected_value) if hasattr(explainer, 'expected_value') else float(shap_res.base_values[0])

    features_info = []
    for i, col in enumerate(FEATURE_ORDER):
        val = df.iloc[0][col]
        shap_score = float(shap_vals[i])
        features_info.append({
            'feature': col,
            'label': FEATURE_LABELS.get(col, col),
            'value': val if col in CATEGORICAL_FEATURES else round(float(val), 2),
            'shap_value': round(shap_score, 4),
            'impact': 'positive' if shap_score > 0 else ('negative' if shap_score < 0 else 'neutral'),
            'abs_shap': abs(shap_score)
        })

    # Separate into positive and negative
    positive_factors = [f for f in features_info if f['shap_value'] > 0]
    positive_factors.sort(key=lambda x: x['shap_value'], reverse=True)

    negative_factors = [f for f in features_info if f['shap_value'] < 0]
    negative_factors.sort(key=lambda x: x['shap_value'])  # most negative first

    # Top overall factors by absolute impact
    all_sorted = sorted(features_info, key=lambda x: x['abs_shap'], reverse=True)

    return {
        'base_value': round(base_val, 4),
        'positive_factors': positive_factors[:max_factors],
        'negative_factors': negative_factors[:max_factors],
        'top_overall': all_sorted[:10],
        'all_factors': features_info
    }

# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------
class ApplicantData(BaseModel):
    # Personal
    age: int = Field(..., ge=18, le=100, description="Applicant age in years")
    gender: str = Field(..., description="Gender (Male, Female)")
    marital_status: str = Field(..., description="Marital status (Single, Married, Divorced, Widowed)")
    dependents: int = Field(..., ge=0, le=20, description="Number of dependents")
    education: str = Field(..., description="Education level (12th, Diploma, Graduate, Postgraduate, Professional)")

    # Employment
    employment_type: str = Field(..., description="Employment type (Salaried, Self-employed, Business owner, Professional, Contract)")
    employment_years: float = Field(..., ge=0, le=60, description="Years in current employment/profession")
    city_tier: str = Field(..., description="City tier (Tier 1, Tier 2, Tier 3)")

    # Income
    monthly_income: float = Field(..., ge=0, description="Primary applicant monthly income in INR")
    coapplicant_income: float = Field(0.0, ge=0, description="Co-applicant monthly income in INR")
    other_monthly_income: float = Field(0.0, ge=0, description="Other monthly income in INR")

    # Existing Finances
    existing_loan_count: int = Field(0, ge=0, le=50, description="Count of existing active loans")
    existing_emi: float = Field(0.0, ge=0, description="Total monthly EMI of existing loans")
    credit_card_outstanding: float = Field(0.0, ge=0, description="Credit card outstanding balance")
    monthly_expenses: float = Field(0.0, ge=0, description="Monthly household expenditures")
    total_outstanding_debt: float = Field(0.0, ge=0, description="Total existing debt principal outstanding")

    # Credit Profile
    credit_score: int = Field(..., ge=300, le=900, description="Credit score (CIBIL 300 to 900)")
    credit_history_years: float = Field(..., ge=0, le=60, description="Years of credit history")
    active_credit_accounts: int = Field(0, ge=0, le=50, description="Total active credit lines/accounts")
    late_payments_12m: int = Field(0, ge=0, le=50, description="Late payments recorded in past 12 months")
    previous_defaults: int = Field(0, ge=0, le=50, description="Previous default count (0 to 50)")
    credit_enquiries_6m: int = Field(0, ge=0, le=50, description="Hard credit enquiries in past 6 months")
    credit_utilization: float = Field(..., ge=0.0, le=5.0, description="Credit utilization ratio (e.g. 0.25 for 25%)")

    # Assets
    savings_balance: float = Field(0.0, ge=0, description="Liquid savings and bank balance in INR")
    property_value: float = Field(0.0, ge=0, description="Real estate / property market valuation in INR")
    vehicle_value: float = Field(0.0, ge=0, description="Vehicle asset valuation in INR")
    investment_value: float = Field(0.0, ge=0, description="Mutual funds, stocks, gold valuation in INR")

    # Loan Request
    loan_amount: float = Field(..., gt=0, description="Requested loan amount in INR")
    loan_tenure_months: int = Field(..., gt=0, le=480, description="Requested tenure in calendar months")
    loan_purpose: str = Field(..., description="Loan purpose (Home, Personal, Vehicle, Education, Medical, Business)")
    annual_interest_rate: float = Field(..., ge=0.0, le=50.0, description="Annual interest rate in %")

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class UpdateReviewStatusRequest(BaseModel):
    status: str
    note: Optional[str] = None

class AddReviewNoteRequest(BaseModel):
    note: str

class ManualOverrideRequest(BaseModel):
    status: str
    reason: str

# ---------------------------------------------------------------------------
# Public Applicant-Facing API Endpoints (Preserved + Persisted)
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KnowYourLoan CatBoost & SHAP Engine",
        "model_loaded": model is not None,
        "explainer_ready": explainer is not None,
        "threshold": THRESHOLD,
        "features_count": len(FEATURE_ORDER)
    }

@app.post("/predict")
def predict_endpoint(applicant: ApplicantData):
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    try:
        data_dict = applicant.model_dump()
        df, derived = prepare_dataframe(data_dict)

        prob = float(model.predict_proba(df)[0][1])
        prediction = "APPROVED" if prob >= THRESHOLD else "REJECTED"

        # Generate actual SHAP explanation
        explanation = compute_shap_factors(df)

        # Generate application ID (KYL-YYYYMMDD-XXXX)
        app_id = f"KYL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        # Persist submission into real SQLite database
        persisted = save_application(
            app_id=app_id,
            applicant_data=data_dict,
            derived_features=derived,
            model_prediction=prediction,
            approval_probability=round(prob, 4),
            threshold=THRESHOLD,
            shap_explanation=explanation
        )

        return {
            "application_id": app_id,
            "prediction": prediction,
            "probability": round(prob, 4),
            "probability_percentage": round(prob * 100, 2),
            "threshold": THRESHOLD,
            "threshold_percentage": round(THRESHOLD * 100, 2),
            "derived_features": derived,
            "explanation": explanation,
            "model_type": "CatBoostClassifier",
            "review_status": persisted["review_status"],
            "created_at": persisted["created_at"],
            "disclaimer": "MODEL PREDICTION: This assessment is an automated machine learning evaluation based on historical underwriting patterns. It does not constitute a legal, formal, or binding credit sanction."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction evaluation failed: {str(e)}")

@app.post("/explain")
def explain_endpoint(applicant: ApplicantData):
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    try:
        data_dict = applicant.model_dump()
        df, _ = prepare_dataframe(data_dict)
        explanation = compute_shap_factors(df)
        return {
            "explanation": explanation,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Explainability evaluation failed: {str(e)}")

# ---------------------------------------------------------------------------
# Admin Authentication Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/admin/login")
def admin_login(body: AdminLoginRequest):
    user = authenticate_admin_credentials(body.username, body.password)
    if not user:
        record_audit_log(
            admin_username=body.username or "unknown",
            action="LOGIN_FAILED",
            details="Invalid username or password attempt"
        )
        raise HTTPException(status_code=401, detail="Invalid admin username or password.")

    token = create_admin_session(user["username"])
    record_audit_log(
        admin_username=user["username"],
        action="LOGIN_SUCCESS",
        details="Admin logged in successfully"
    )

    return {
        "token": token,
        "username": user["username"],
        "role": user["role"],
        "full_name": user["full_name"],
        "message": "Admin session authenticated successfully."
    }

@app.post("/api/admin/logout")
def admin_logout(
    current_admin: Dict[str, Any] = Depends(get_current_admin),
    authorization: Optional[str] = Header(None)
):
    if authorization:
        parts = authorization.split()
        if len(parts) == 2:
            revoke_admin_session(parts[1])

    record_audit_log(
        admin_username=current_admin["username"],
        action="LOGOUT",
        details="Admin logged out session"
    )
    return {"status": "logged_out", "message": "Admin session revoked."}

@app.get("/api/admin/me")
def admin_me(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    return {
        "username": current_admin["username"],
        "role": current_admin["role"],
        "full_name": current_admin["full_name"]
    }

# ---------------------------------------------------------------------------
# Admin Protected Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/admin/overview")
def admin_overview(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    df = date_from if isinstance(date_from, str) else None
    dt = date_to if isinstance(date_to, str) else None
    return get_overview_metrics(date_from=df, date_to=dt)

@app.get("/api/admin/applications")
def admin_list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    model_prediction: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    min_prob: Optional[float] = Query(None),
    max_prob: Optional[float] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    return query_applications(
        page=page if isinstance(page, int) else 1,
        page_size=page_size if isinstance(page_size, int) else 20,
        search=search if isinstance(search, str) else None,
        model_prediction=model_prediction if isinstance(model_prediction, str) else None,
        review_status=review_status if isinstance(review_status, str) else None,
        date_from=date_from if isinstance(date_from, str) else None,
        date_to=date_to if isinstance(date_to, str) else None,
        min_amount=float(min_amount) if isinstance(min_amount, (int, float)) else None,
        max_amount=float(max_amount) if isinstance(max_amount, (int, float)) else None,
        min_prob=float(min_prob) if isinstance(min_prob, (int, float)) else None,
        max_prob=float(max_prob) if isinstance(max_prob, (int, float)) else None,
        sort_by=sort_by if isinstance(sort_by, str) else "created_at",
        sort_order=sort_order if isinstance(sort_order, str) else "desc"
    )

@app.get("/api/admin/applications/{app_id}")
def admin_get_application(
    app_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    app_data = get_application_by_id(app_id)
    if not app_data:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found.")
    return app_data

@app.post("/api/admin/applications/{app_id}/review-status")
def admin_update_review_status(
    app_id: str,
    body: UpdateReviewStatusRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    if body.status not in ("PENDING REVIEW", "UNDER REVIEW", "REVIEWED"):
        raise HTTPException(status_code=400, detail="Invalid review status. Must be 'PENDING REVIEW' or 'REVIEWED'.")

    try:
        updated = update_review_status(
            app_id=app_id,
            new_status=body.status,
            admin_username=current_admin["username"],
            note=body.note
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/admin/applications/{app_id}/notes")
def admin_add_note(
    app_id: str,
    body: AddReviewNoteRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    if not body.note or not body.note.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")

    try:
        res = add_review_note(
            app_id=app_id,
            note=body.note,
            admin_username=current_admin["username"]
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/admin/applications/{app_id}/override")
def admin_override_decision(
    app_id: str,
    body: ManualOverrideRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    if body.status not in ("MANUAL_APPROVED", "MANUAL_REJECTED", "RESET"):
        raise HTTPException(status_code=400, detail="Invalid override status.")
    if not body.reason or not body.reason.strip():
        raise HTTPException(status_code=400, detail="Override reason is required.")

    try:
        res = update_manual_override(
            app_id=app_id,
            override_status=body.status,
            reason=body.reason.strip(),
            admin_username=current_admin["username"]
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/admin/analytics")
def admin_analytics(current_admin: Dict[str, Any] = Depends(get_current_admin)):
    return get_analytics_data()

@app.get("/api/admin/audit-logs")
def admin_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    p = page if isinstance(page, int) else 1
    ps = page_size if isinstance(page_size, int) else 30
    return get_audit_logs(page=p, page_size=ps)

@app.get("/api/admin/reports/csv")
def admin_export_csv(
    search: Optional[str] = Query(None),
    model_prediction: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    min_prob: Optional[float] = Query(None),
    max_prob: Optional[float] = Query(None),
    current_admin: Dict[str, Any] = Depends(get_current_admin)
):
    """Generates real filtered CSV export of applications from the SQLite database."""
    res = query_applications(
        page=1,
        page_size=10000,
        search=search,
        model_prediction=model_prediction,
        review_status=review_status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        min_prob=min_prob,
        max_prob=max_prob,
        sort_by="created_at",
        sort_order="desc"
    )

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Application ID",
        "Submission Timestamp",
        "Model Prediction",
        "Approval Probability",
        "Decision Threshold",
        "Admin Review Status",
        "Manual Override Status",
        "Loan Amount (INR)",
        "Credit Score",
        "Previous Defaults",
        "FOIR",
        "DTI Ratio"
    ])

    for item in res["items"]:
        app_data = item.get("applicant_data") or {}
        prev_defs = app_data.get("previous_defaults", 0) if isinstance(app_data, dict) else 0
        writer.writerow([
            item["id"],
            item["created_at"],
            item["model_prediction"],
            item["approval_probability"],
            item["decision_threshold"],
            item["review_status"],
            item.get("manual_override_status") or "None",
            item["loan_amount"],
            item["credit_score"],
            prev_defs,
            item["foir"],
            item["dti_ratio"]
        ])

    record_audit_log(
        admin_username=current_admin["username"],
        action="EXPORT_CSV",
        details=f"Exported {len(res['items'])} application records"
    )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=knowyourloan_applications_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"}
    )
