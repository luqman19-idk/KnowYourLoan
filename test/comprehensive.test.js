import { describe, it, expect } from 'vitest';
import { 
  validateApplication, 
  prepareApplicationPayload,
  calculateDerivedFeaturesClient, 
  formatINR,
  FIELD_METADATA,
  CATEGORICAL_OPTIONS 
} from '../src/utils/validation.js';
import { READABLE_FEATURE_NAMES, GLOBAL_SHAP_IMPORTANCE } from '../src/ml/explainability.js';

describe('KnowYourLoan 35-Feature Production Verification Suite', () => {

  const primeApplicant = {
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

  // 1. Validation check for valid application
  it('1. validateApplication passes for a complete, valid 31-input profile', () => {
    const val = validateApplication(primeApplicant);
    expect(val.isValid).toBe(true);
    expect(Object.keys(val.errors).length).toBe(0);
  });

  // 2. Missing required fields check
  it('2. validateApplication flags missing required fields', () => {
    const invalid = { ...primeApplicant, monthly_income: '' };
    const val = validateApplication(invalid);
    expect(val.isValid).toBe(false);
    expect(val.errors.monthly_income).toBeDefined();
  });

  // 3. Negative income check
  it('3. validateApplication catches negative income', () => {
    const invalid = { ...primeApplicant, monthly_income: -5000 };
    const val = validateApplication(invalid);
    expect(val.isValid).toBe(false);
    expect(val.errors.monthly_income).toMatch(/cannot be negative|cannot be less than/);
  });

  // 4. Invalid credit score check
  it('4. validateApplication catches credit score below 300 or above 900', () => {
    const low = { ...primeApplicant, credit_score: 250 };
    const high = { ...primeApplicant, credit_score: 950 };
    expect(validateApplication(low).isValid).toBe(false);
    expect(validateApplication(high).isValid).toBe(false);
  });

  // 5. Invalid loan tenure check
  it('5. validateApplication flags invalid tenure below min', () => {
    const invalid = { ...primeApplicant, loan_tenure_months: 0 };
    expect(validateApplication(invalid).isValid).toBe(false);
  });

  // 6. Invalid credit utilization check
  it('6. validateApplication flags negative credit utilization', () => {
    const invalid = { ...primeApplicant, credit_utilization: -0.1 };
    expect(validateApplication(invalid).isValid).toBe(false);
  });

  // 7. Derived Features: Amortized EMI calculation
  it('7. calculateDerivedFeaturesClient produces correct PMT EMI for ₹15L @ 8.5% for 120mo', () => {
    const derived = calculateDerivedFeaturesClient(primeApplicant);
    // Formula: 1500000 * (8.5/12/100) * (1+r)^120 / ((1+r)^120 - 1) ≈ ₹18599
    expect(derived.new_loan_emi).toBeGreaterThan(18000);
    expect(derived.new_loan_emi).toBeLessThan(19000);
  });

  // 8. Derived Features: Total Monthly Debt
  it('8. calculateDerivedFeaturesClient sums existing_emi + new_loan_emi accurately', () => {
    const derived = calculateDerivedFeaturesClient(primeApplicant);
    const expected = 8000 + derived.new_loan_emi;
    expect(Math.abs(derived.total_monthly_debt - expected)).toBeLessThan(1);
  });

  // 9. Derived Features: DTI Ratio
  it('9. calculateDerivedFeaturesClient calculates realistic DTI ratio', () => {
    const derived = calculateDerivedFeaturesClient(primeApplicant);
    // Total income = 120000 + 50000 + 10000 = 180000
    // Total debt ≈ 8000 + 18599 ≈ 26599
    // DTI ≈ 26599 / 180000 ≈ 0.1477 (14.8%)
    expect(derived.dti_ratio).toBeGreaterThan(0.10);
    expect(derived.dti_ratio).toBeLessThan(0.25);
  });

  // 10. Derived Features: FOIR
  it('10. calculateDerivedFeaturesClient calculates realistic FOIR ratio', () => {
    const derived = calculateDerivedFeaturesClient(primeApplicant);
    // Denominator = 180000 - 35000*0.5 = 162500
    // FOIR ≈ 26599 / 162500 ≈ 0.1637 (16.4%)
    expect(derived.foir).toBeGreaterThan(0.10);
    expect(derived.foir).toBeLessThan(0.30);
  });

  // 11. Zero interest rate fallback
  it('11. calculateDerivedFeaturesClient handles 0% interest rate without dividing by zero', () => {
    const zeroInterest = { ...primeApplicant, annual_interest_rate: 0 };
    const derived = calculateDerivedFeaturesClient(zeroInterest);
    expect(derived.new_loan_emi).toBe(primeApplicant.loan_amount / primeApplicant.loan_tenure_months);
  });

  // 12. Human-readable feature names coverage
  it('12. READABLE_FEATURE_NAMES contains friendly labels for all 35 features', () => {
    expect(READABLE_FEATURE_NAMES.credit_score).toBe('Credit Score (CIBIL)');
    expect(READABLE_FEATURE_NAMES.foir).toBe('Fixed Obligation to Income (FOIR)');
    expect(READABLE_FEATURE_NAMES.new_loan_emi).toBe('Calculated New Loan EMI');
    expect(READABLE_FEATURE_NAMES.savings_balance).toBe('Savings & Bank Balance');
    expect(Object.keys(READABLE_FEATURE_NAMES).length).toBe(35);
  });

  // 13. Global SHAP hierarchy
  it('13. GLOBAL_SHAP_IMPORTANCE ranks top features', () => {
    expect(GLOBAL_SHAP_IMPORTANCE.length).toBeGreaterThan(0);
    expect(GLOBAL_SHAP_IMPORTANCE[0].rank).toBe(1);
  });

  // 14. INR Formatter
  it('14. formatINR formats currency correctly in Indian numbering system', () => {
    expect(formatINR(1500000)).toMatch(/₹\s?15,00,000/);
    expect(formatINR(1500000, true)).toBe('₹15 L');
    expect(formatINR(10000000, true)).toBe('₹1 Cr');
  });

  // 15. Categorical options coverage
  it('15. CATEGORICAL_OPTIONS includes all required dimensions', () => {
    expect(CATEGORICAL_OPTIONS.gender).toContain('Male');
    expect(CATEGORICAL_OPTIONS.marital_status).toContain('Married');
    expect(CATEGORICAL_OPTIONS.education).toContain('Graduate');
    expect(CATEGORICAL_OPTIONS.employment_type).toContain('Salaried');
    expect(CATEGORICAL_OPTIONS.city_tier).toContain('Tier 1');
    expect(CATEGORICAL_OPTIONS.loan_purpose).toContain('Home');
  });

  // 16. Audit requirement: accepts arbitrary legitimate monetary and decimal values
  it('16. Accepts all legitimate monetary values without artificial step increments', () => {
    const testCases = [
      { existing_emi: 18500, loan_amount: 2800000 },
      { existing_emi: 87500, loan_amount: 2785000 },
      { monthly_income: 62500, coapplicant_income: 145500 },
      { monthly_expenses: 123450, total_outstanding_debt: 2785000 },
      { annual_interest_rate: 8.75, credit_utilization: 0.37 },
      { annual_interest_rate: 13.25, savings_balance: 145000 }
    ];

    testCases.forEach((overrides) => {
      const app = { ...primeApplicant, ...overrides };
      const res = validateApplication(app);
      expect(res.isValid).toBe(true);
    });
  });

  // 17. Previous Defaults count tests (0, 1, 2, 3, 5, up to 50)
  it('17. previous_defaults accepts counts 0, 1, 2, 3, 5, up to 50 without binary truncation', () => {
    [0, 1, 2, 3, 5, 10, 50].forEach((count) => {
      const app = { ...primeApplicant, previous_defaults: count };
      const res = validateApplication(app);
      expect(res.isValid).toBe(true);
      expect(res.errors.previous_defaults).toBeUndefined();
    });
  });

  // 18. Previous Defaults validation errors for negatives, decimals, and > 50
  it('18. previous_defaults flags negative values, decimals, and values > 50', () => {
    const negative = { ...primeApplicant, previous_defaults: -1 };
    expect(validateApplication(negative).isValid).toBe(false);
    expect(validateApplication(negative).errors.previous_defaults).toMatch(/cannot be negative/);

    const decimal = { ...primeApplicant, previous_defaults: 2.5 };
    expect(validateApplication(decimal).isValid).toBe(false);
    expect(validateApplication(decimal).errors.previous_defaults).toMatch(/must be a whole number/);

    const overLimit = { ...primeApplicant, previous_defaults: 51 };
    expect(validateApplication(overLimit).isValid).toBe(false);
    expect(validateApplication(overLimit).errors.previous_defaults).toMatch(/cannot exceed 50/);
  });

  // 19. prepareApplicationPayload converts empty optional numeric fields to 0
  it('19. prepareApplicationPayload converts blank optional numeric fields to 0 and keeps blank required fields', () => {
    const formWithBlanks = {
      age: 30,
      gender: 'Male',
      marital_status: 'Single',
      dependents: '',
      education: 'Graduate',
      employment_type: 'Salaried',
      employment_years: '',
      city_tier: 'Tier 1',
      monthly_income: 75000,
      coapplicant_income: '',
      other_monthly_income: '',
      existing_loan_count: '',
      existing_emi: '',
      credit_card_outstanding: '',
      monthly_expenses: '',
      total_outstanding_debt: '',
      credit_score: 750,
      credit_history_years: '',
      active_credit_accounts: '',
      late_payments_12m: '',
      previous_defaults: '',
      credit_enquiries_6m: '',
      credit_utilization: '',
      savings_balance: '',
      property_value: '',
      vehicle_value: '',
      investment_value: '',
      loan_amount: 500000,
      loan_tenure_months: 36,
      loan_purpose: 'Personal',
      annual_interest_rate: 11.5,
    };

    const payload = prepareApplicationPayload(formWithBlanks);
    expect(payload.dependents).toBe(0);
    expect(payload.coapplicant_income).toBe(0);
    expect(payload.other_monthly_income).toBe(0);
    expect(payload.existing_loan_count).toBe(0);
    expect(payload.existing_emi).toBe(0);
    expect(payload.previous_defaults).toBe(0);
    expect(payload.savings_balance).toBe(0);
    expect(payload.property_value).toBe(0);

    const val = validateApplication(payload);
    expect(val.isValid).toBe(true);
  });

  // 20. Required fields left blank fail validation
  it('20. Required numeric fields left blank fail validation with descriptive messages', () => {
    const allBlank = {
      age: '',
      credit_score: '',
      loan_amount: '',
      loan_tenure_months: '',
      monthly_income: '',
      annual_interest_rate: '',
    };
    const payload = prepareApplicationPayload(allBlank);
    const val = validateApplication(payload);
    expect(val.isValid).toBe(false);
    expect(val.errors.age).toBeDefined();
    expect(val.errors.credit_score).toBeDefined();
    expect(val.errors.loan_amount).toBeDefined();
    expect(val.errors.loan_tenure_months).toBeDefined();
  });

});

