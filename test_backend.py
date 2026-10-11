import os
import tempfile
import unittest

test_db = os.path.join(tempfile.gettempdir(), "kyl_test_backend.db")
os.environ["KYL_DB_PATH"] = test_db

from backend.app import app, load_ml_model, predict_endpoint, explain_endpoint, ApplicantData
import backend.database as db_mod
db_mod.DB_PATH = test_db
db_mod.init_db()

class TestKnowYourLoanBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load_ml_model()

    def test_case_1_strong_applicant(self):
        case_1 = {
            "age": 34,
            "gender": "Male",
            "marital_status": "Married",
            "dependents": 1,
            "education": "Postgraduate",
            "employment_type": "Salaried",
            "employment_years": 9.0,
            "city_tier": "Tier 1",
            "monthly_income": 120000.0,
            "coapplicant_income": 50000.0,
            "other_monthly_income": 10000.0,
            "existing_loan_count": 1,
            "existing_emi": 8000.0,
            "credit_card_outstanding": 15000.0,
            "monthly_expenses": 35000.0,
            "total_outstanding_debt": 350000.0,
            "credit_score": 790,
            "credit_history_years": 11.0,
            "active_credit_accounts": 4,
            "late_payments_12m": 0,
            "previous_defaults": 0,
            "credit_enquiries_6m": 1,
            "credit_utilization": 0.25,
            "savings_balance": 900000.0,
            "property_value": 7000000.0,
            "vehicle_value": 900000.0,
            "investment_value": 1200000.0,
            "loan_amount": 1500000.0,
            "loan_tenure_months": 120,
            "loan_purpose": "Home",
            "annual_interest_rate": 8.5
        }
        req = ApplicantData(**case_1)
        res = predict_endpoint(req)
        self.assertEqual(res["prediction"], "APPROVED")
        self.assertGreaterEqual(res["probability"], 0.45)
        self.assertEqual(res["threshold"], 0.45)
        self.assertIn("positive_factors", res["explanation"])
        self.assertIn("negative_factors", res["explanation"])

    def test_case_3_weak_applicant(self):
        case_3 = {
            "age": 27,
            "gender": "Male",
            "marital_status": "Single",
            "dependents": 2,
            "education": "Graduate",
            "employment_type": "Contract",
            "employment_years": 2.0,
            "city_tier": "Tier 2",
            "monthly_income": 40000.0,
            "coapplicant_income": 0.0,
            "other_monthly_income": 0.0,
            "existing_loan_count": 3,
            "existing_emi": 14000.0,
            "credit_card_outstanding": 70000.0,
            "monthly_expenses": 22000.0,
            "total_outstanding_debt": 800000.0,
            "credit_score": 520,
            "credit_history_years": 4.0,
            "active_credit_accounts": 6,
            "late_payments_12m": 4,
            "previous_defaults": 1,
            "credit_enquiries_6m": 6,
            "credit_utilization": 0.82,
            "savings_balance": 30000.0,
            "property_value": 0.0,
            "vehicle_value": 250000.0,
            "investment_value": 0.0,
            "loan_amount": 2000000.0,
            "loan_tenure_months": 60,
            "loan_purpose": "Personal",
            "annual_interest_rate": 13.5
        }
        req = ApplicantData(**case_3)
        res = predict_endpoint(req)
        self.assertEqual(res["prediction"], "REJECTED")
        self.assertLess(res["probability"], 0.45)

    def test_arbitrary_monetary_and_decimal_values(self):
        # Explicit test for user-specified non-round values
        applicant = {
            "age": 32,
            "gender": "Female",
            "marital_status": "Single",
            "dependents": 0,
            "education": "Professional",
            "employment_type": "Salaried",
            "employment_years": 6.5,
            "city_tier": "Tier 1",
            "monthly_income": 62500.0,
            "coapplicant_income": 145500.0,
            "other_monthly_income": 87500.0,
            "existing_loan_count": 2,
            "existing_emi": 18500.0,
            "credit_card_outstanding": 62500.0,
            "monthly_expenses": 123450.0,
            "total_outstanding_debt": 2785000.0,
            "credit_score": 765,
            "credit_history_years": 8.5,
            "active_credit_accounts": 5,
            "late_payments_12m": 0,
            "previous_defaults": 0,
            "credit_enquiries_6m": 2,
            "credit_utilization": 0.37,
            "savings_balance": 145000.0,
            "property_value": 5500000.0,
            "vehicle_value": 450000.0,
            "investment_value": 325000.0,
            "loan_amount": 2800000.0,
            "loan_tenure_months": 180,
            "loan_purpose": "Home",
            "annual_interest_rate": 8.75
        }
        req = ApplicantData(**applicant)
        res = predict_endpoint(req)
        self.assertIn("prediction", res)
        self.assertIn("probability", res)
        self.assertEqual(res["threshold"], 0.45)

    def test_previous_defaults_count_support(self):
        # Explicit test verifying previous_defaults supports counts like 2, 5, 10
        for defaults_count in [0, 1, 2, 5, 10, 50]:
            case = {
                "age": 35,
                "gender": "Male",
                "marital_status": "Married",
                "dependents": 1,
                "education": "Graduate",
                "employment_type": "Salaried",
                "employment_years": 5.0,
                "city_tier": "Tier 1",
                "monthly_income": 80000.0,
                "coapplicant_income": 0.0,
                "other_monthly_income": 0.0,
                "existing_loan_count": 1,
                "existing_emi": 5000.0,
                "credit_card_outstanding": 10000.0,
                "monthly_expenses": 25000.0,
                "total_outstanding_debt": 100000.0,
                "credit_score": 680,
                "credit_history_years": 7.0,
                "active_credit_accounts": 3,
                "late_payments_12m": 1,
                "previous_defaults": defaults_count,
                "credit_enquiries_6m": 1,
                "credit_utilization": 0.35,
                "savings_balance": 200000.0,
                "property_value": 0.0,
                "vehicle_value": 0.0,
                "investment_value": 0.0,
                "loan_amount": 500000.0,
                "loan_tenure_months": 36,
                "loan_purpose": "Personal",
                "annual_interest_rate": 12.0
            }
            req = ApplicantData(**case)
            res = predict_endpoint(req)
            self.assertIn("prediction", res)
            self.assertIn("probability", res)
            self.assertEqual(res["threshold"], 0.45)

    def tearDown(self):
        pass


if __name__ == "__main__":
    import os, tempfile
    test_db = os.path.join(tempfile.gettempdir(), "kyl_test_backend.db")
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

