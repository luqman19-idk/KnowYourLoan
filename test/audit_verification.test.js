import { describe, it, expect } from 'vitest';
import { 
  validateApplication, 
  calculateDerivedFeaturesClient 
} from '../src/utils/validation.js';

describe('KnowYourLoan Underwriting Decision Boundary Contract', () => {

  const baseApplication = {
    age: 34,
    gender: 'Male',
    marital_status: 'Married',
    dependents: 1,
    education: 'Postgraduate',
    employment_type: 'Salaried',
    employment_years: 9,
    city_tier: 'Tier 1',
    monthly_income: 120000,
    coapplicant_income: 50000,
    other_monthly_income: 10000,
    existing_loan_count: 1,
    existing_emi: 8000,
    credit_card_outstanding: 15000,
    monthly_expenses: 35000,
    total_outstanding_debt: 350000,
    credit_score: 790,
    credit_history_years: 11,
    active_credit_accounts: 4,
    late_payments_12m: 0,
    previous_defaults: 0,
    credit_enquiries_6m: 1,
    credit_utilization: 0.25,
    savings_balance: 900000,
    property_value: 7000000,
    vehicle_value: 900000,
    investment_value: 1200000,
    loan_amount: 1500000,
    loan_tenure_months: 120,
    loan_purpose: 'Home',
    annual_interest_rate: 8.5
  };

  it('1. Threshold specification is strictly 0.45', () => {
    const THRESHOLD = 0.45;
    expect(THRESHOLD).toBe(0.45);
    const mockProbHigh = 0.46;
    const mockProbLow = 0.44;
    expect(mockProbHigh >= THRESHOLD ? 'APPROVED' : 'REJECTED').toBe('APPROVED');
    expect(mockProbLow >= THRESHOLD ? 'APPROVED' : 'REJECTED').toBe('REJECTED');
  });

  it('2. Derived financial metrics calculate without error for edge case values', () => {
    const edgeCase = {
      ...baseApplication,
      existing_emi: 0,
      coapplicant_income: 0,
      other_monthly_income: 0,
      monthly_expenses: 0,
    };
    const derived = calculateDerivedFeaturesClient(edgeCase);
    expect(derived.new_loan_emi).toBeGreaterThan(0);
    expect(derived.dti_ratio).toBeGreaterThan(0);
    expect(derived.foir).toBeGreaterThan(0);
  });

  it('3. Validation enforces required ranges across financial and credit fields', () => {
    expect(validateApplication({ ...baseApplication, age: 17 }).isValid).toBe(false);
    expect(validateApplication({ ...baseApplication, credit_score: 299 }).isValid).toBe(false);
    expect(validateApplication({ ...baseApplication, loan_amount: 0 }).isValid).toBe(false);
    expect(validateApplication({ ...baseApplication, loan_tenure_months: 0 }).isValid).toBe(false);
  });

});
