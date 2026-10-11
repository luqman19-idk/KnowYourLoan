import { describe, it, expect } from 'vitest';
import { calculateDerivedFeaturesClient } from '../src/utils/validation.js';
import { READABLE_FEATURE_NAMES } from '../src/ml/explainability.js';

describe('KnowYourLoan ML Feature & Formula Tests', () => {

  const testApp = {
    age: 31,
    gender: 'Male',
    marital_status: 'Married',
    dependents: 2,
    education: 'Graduate',
    employment_type: 'Salaried',
    employment_years: 4,
    city_tier: 'Tier 2',
    monthly_income: 65000,
    coapplicant_income: 20000,
    other_monthly_income: 0,
    existing_loan_count: 2,
    existing_emi: 12000,
    credit_card_outstanding: 45000,
    monthly_expenses: 26000,
    total_outstanding_debt: 600000,
    credit_score: 680,
    credit_history_years: 7,
    active_credit_accounts: 5,
    late_payments_12m: 1,
    previous_defaults: 0,
    credit_enquiries_6m: 3,
    credit_utilization: 0.48,
    savings_balance: 250000,
    property_value: 3000000,
    vehicle_value: 500000,
    investment_value: 200000,
    loan_amount: 1200000,
    loan_tenure_months: 84,
    loan_purpose: 'Personal',
    annual_interest_rate: 13.5
  };

  it('1. Computes exact derived EMI for personal loan scenario', () => {
    const derived = calculateDerivedFeaturesClient(testApp);
    // Loan: ₹12L @ 13.5% for 84 months
    // Monthly rate = 13.5 / 12 / 100 = 0.01125
    expect(derived.new_loan_emi).toBeGreaterThan(21000);
    expect(derived.new_loan_emi).toBeLessThan(23000);
  });

  it('2. Computes correct total debt obligations', () => {
    const derived = calculateDerivedFeaturesClient(testApp);
    expect(Math.abs(derived.total_monthly_debt - (12000 + derived.new_loan_emi))).toBeLessThan(0.01);
  });

  it('3. Computes correct DTI ratio', () => {
    const derived = calculateDerivedFeaturesClient(testApp);
    const totalIncome = 65000 + 20000;
    const expectedDti = Math.round((derived.total_monthly_debt / totalIncome) * 10000) / 10000;
    expect(derived.dti_ratio).toBe(expectedDti);
  });

  it('4. Feature names dictionary matches expected model feature set count', () => {
    expect(Object.keys(READABLE_FEATURE_NAMES).length).toBe(35);
  });

});
