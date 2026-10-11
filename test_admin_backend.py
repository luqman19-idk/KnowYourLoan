import os
import tempfile
import unittest

test_db = os.path.join(tempfile.gettempdir(), "kyl_test_admin.db")
os.environ["KYL_DB_PATH"] = test_db

from backend.app import (
    app,
    load_ml_model,
    predict_endpoint,
    explain_endpoint,
    ApplicantData,
    admin_login,
    AdminLoginRequest,
    admin_overview,
    admin_list_applications,
    admin_get_application,
    admin_update_review_status,
    UpdateReviewStatusRequest,
    admin_override_decision,
    ManualOverrideRequest,
    admin_add_note,
    AddReviewNoteRequest,
    admin_audit_logs,
    admin_analytics
)
import backend.database as db_mod
db_mod.DB_PATH = test_db
from backend.database import init_db, get_application_by_id

class TestKnowYourLoanAdminBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        load_ml_model()

    def setUp(self):
        # Authenticate admin
        login_res = admin_login(AdminLoginRequest(username="admin", password="Admin@KYL2026"))
        self.admin_token = login_res["token"]
        self.admin_user = {
            "username": login_res["username"],
            "role": login_res["role"],
            "full_name": login_res["full_name"],
            "token": self.admin_token
        }

    def test_predict_and_persistence(self):
        case_data = {
            "age": 35,
            "gender": "Male",
            "marital_status": "Married",
            "dependents": 1,
            "education": "Postgraduate",
            "employment_type": "Salaried",
            "employment_years": 8.0,
            "city_tier": "Tier 1",
            "monthly_income": 110000.0,
            "coapplicant_income": 40000.0,
            "other_monthly_income": 5000.0,
            "existing_loan_count": 1,
            "existing_emi": 9000.0,
            "credit_card_outstanding": 12000.0,
            "monthly_expenses": 32000.0,
            "total_outstanding_debt": 300000.0,
            "credit_score": 780,
            "credit_history_years": 10.0,
            "active_credit_accounts": 4,
            "late_payments_12m": 0,
            "previous_defaults": 0,
            "credit_enquiries_6m": 1,
            "credit_utilization": 0.22,
            "savings_balance": 850000.0,
            "property_value": 6500000.0,
            "vehicle_value": 800000.0,
            "investment_value": 1100000.0,
            "loan_amount": 1400000.0,
            "loan_tenure_months": 120,
            "loan_purpose": "Home",
            "annual_interest_rate": 8.5
        }
        pred_res = predict_endpoint(ApplicantData(**case_data))
        self.assertIn("application_id", pred_res)
        app_id = pred_res["application_id"]
        self.assertTrue(app_id.startswith("KYL-"))
        self.assertEqual(pred_res["review_status"], "PENDING REVIEW")

        # Verify record was stored in SQLite
        stored = get_application_by_id(app_id)
        self.assertIsNotNone(stored)
        self.assertEqual(stored["id"], app_id)
        self.assertEqual(stored["model_prediction"], pred_res["prediction"])
        self.assertEqual(stored["review_status"], "PENDING REVIEW")

        # Test Admin Status Update
        status_res = admin_update_review_status(
            app_id=app_id,
            body=UpdateReviewStatusRequest(status="REVIEWED", note="Documents verified by underwriting"),
            current_admin=self.admin_user
        )
        self.assertEqual(status_res["review_status"], "REVIEWED")

        # Verify Status Changed in DB
        reloaded = get_application_by_id(app_id)
        self.assertEqual(reloaded["review_status"], "REVIEWED")
        self.assertEqual(len(reloaded["review_notes"]), 1)
        self.assertEqual(reloaded["review_notes"][0]["note"], "Documents verified by underwriting")

        # Test Manual Override
        override_res = admin_override_decision(
            app_id=app_id,
            body=ManualOverrideRequest(status="MANUAL_APPROVED", reason="High collateral and strong coapplicant"),
            current_admin=self.admin_user
        )
        self.assertEqual(override_res["manual_override_status"], "MANUAL_APPROVED")

        reloaded_after_override = get_application_by_id(app_id)
        # Original model prediction must be preserved!
        self.assertEqual(reloaded_after_override["model_prediction"], pred_res["prediction"])
        self.assertEqual(reloaded_after_override["manual_override_status"], "MANUAL_APPROVED")

        # Test Overview metrics
        overview = admin_overview(current_admin=self.admin_user)
        self.assertGreaterEqual(overview["total_applications"], 1)

        # Test Audit Logs recorded
        audit = admin_audit_logs(current_admin=self.admin_user)
        self.assertGreaterEqual(audit["total"], 1)
        actions = [log["action"] for log in audit["items"]]
        self.assertIn("STATUS_UPDATE", actions)
        self.assertIn("MANUAL_OVERRIDE", actions)

    def test_numerical_defaults_preserved_in_admin_table_and_detail(self):
        # Explicit test for previous_defaults = 5 and preserving valid 0
        case_with_5_defaults = {
            "age": 30,
            "gender": "Male",
            "marital_status": "Single",
            "dependents": 0,
            "education": "Graduate",
            "employment_type": "Salaried",
            "employment_years": 4.0,
            "city_tier": "Tier 1",
            "monthly_income": 70000.0,
            "coapplicant_income": 0.0,
            "other_monthly_income": 0.0,
            "existing_loan_count": 0,
            "existing_emi": 0.0,
            "credit_card_outstanding": 0.0,
            "monthly_expenses": 20000.0,
            "total_outstanding_debt": 0.0,
            "credit_score": 620,
            "credit_history_years": 5.0,
            "active_credit_accounts": 2,
            "late_payments_12m": 1,
            "previous_defaults": 5,
            "credit_enquiries_6m": 2,
            "credit_utilization": 0.3,
            "savings_balance": 150000.0,
            "property_value": 0.0,
            "vehicle_value": 0.0,
            "investment_value": 0.0,
            "loan_amount": 400000.0,
            "loan_tenure_months": 36,
            "loan_purpose": "Personal",
            "annual_interest_rate": 12.0
        }
        res = predict_endpoint(ApplicantData(**case_with_5_defaults))
        app_id = res["application_id"]
        self.assertEqual(res["review_status"], "PENDING REVIEW")

        # 1. Check get_application_by_id detail
        detail = get_application_by_id(app_id)
        self.assertIsNotNone(detail)
        self.assertEqual(detail["applicant_data"]["previous_defaults"], 5)
        self.assertEqual(detail["applicant_data"]["dependents"], 0)
        self.assertEqual(detail["applicant_data"]["existing_loan_count"], 0)

        # 2. Check admin_list_applications (table / review queue)
        apps_list = admin_list_applications(
            page=1,
            page_size=10,
            review_status="PENDING REVIEW",
            current_admin=self.admin_user
        )
        found_app = next((a for a in apps_list["items"] if a["id"] == app_id), None)
        self.assertIsNotNone(found_app)
        self.assertEqual(found_app["review_status"], "PENDING REVIEW")
        self.assertIn("applicant_data", found_app)
        self.assertEqual(found_app["applicant_data"]["previous_defaults"], 5)

    def tearDown(self):
        pass

if __name__ == "__main__":
    import os, tempfile
    test_db = os.path.join(tempfile.gettempdir(), "kyl_test_admin.db")
    os.environ["KYL_DB_PATH"] = test_db
    import backend.database as db_mod
    db_mod.DB_PATH = test_db
    db_mod.init_db()
    try:
        unittest.main()
    finally:
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except Exception:
                pass
