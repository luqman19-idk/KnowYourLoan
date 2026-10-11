/**
 * Validation and financial calculation utilities for KnowYourLoan
 * Conforms with the 35-feature CatBoost underwriting model.
 * Globally audited: accepts all legitimate values, rejects only genuinely invalid inputs.
 */

export const CATEGORICAL_OPTIONS = {
  gender: ['Male', 'Female'],
  marital_status: ['Single', 'Married', 'Divorced', 'Widowed'],
  education: ['12th', 'Diploma', 'Graduate', 'Postgraduate', 'Professional'],
  employment_type: ['Salaried', 'Self-employed', 'Business owner', 'Professional', 'Contract'],
  city_tier: ['Tier 1', 'Tier 2', 'Tier 3'],
  loan_purpose: ['Home', 'Personal', 'Vehicle', 'Education', 'Medical', 'Business'],
};

export const FIELD_METADATA = {
  // Personal
  age: {
    label: 'Age',
    type: 'integer',
    min: 18,
    max: 100,
    step: 1,
    unit: 'yrs',
    description: 'Applicant age in years (18–100)',
    section: 'Personal',
  },
  gender: {
    label: 'Gender',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.gender,
    description: 'Legal gender identity',
    section: 'Personal',
  },
  marital_status: {
    label: 'Marital Status',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.marital_status,
    description: 'Current marital status',
    section: 'Personal',
  },
  dependents: {
    label: 'Dependents',
    type: 'integer',
    min: 0,
    max: 20,
    step: 1,
    description: 'Number of financial dependents supported',
    section: 'Personal',
  },
  education: {
    label: 'Education',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.education,
    description: 'Highest formal qualification obtained',
    section: 'Personal',
  },

  // Employment
  employment_type: {
    label: 'Employment Type',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.employment_type,
    description: 'Primary source and nature of occupation',
    section: 'Employment',
  },
  employment_years: {
    label: 'Experience (Years)',
    type: 'decimal',
    min: 0,
    max: 60,
    step: 'any',
    unit: 'yrs',
    description: 'Total professional or employment tenure in years',
    section: 'Employment',
  },
  city_tier: {
    label: 'City Tier',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.city_tier,
    description: 'Residential classification tier (Cost of living context)',
    section: 'Employment',
  },

  // Income
  monthly_income: {
    label: 'Monthly Income',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Primary monthly net/gross earnings in INR',
    section: 'Income',
  },
  coapplicant_income: {
    label: 'Co-applicant Income',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Monthly income of spouse/guarantor in INR',
    section: 'Income',
  },
  other_monthly_income: {
    label: 'Other Monthly Income',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Dividends, rentals, side business income in INR',
    section: 'Income',
  },

  // Existing Finances
  existing_loan_count: {
    label: 'Existing Loan Count',
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    description: 'Active credit lines or loans currently ongoing',
    section: 'Existing Finances',
  },
  existing_emi: {
    label: 'Existing Monthly EMI',
    type: 'monetary',
    min: 0,
    max: 50000000,
    step: 'any',
    currency: true,
    description: 'Aggregate monthly outflow towards ongoing EMIs in INR',
    section: 'Existing Finances',
  },
  credit_card_outstanding: {
    label: 'Credit Card Outstanding',
    type: 'monetary',
    min: 0,
    max: 100000000,
    step: 'any',
    currency: true,
    description: 'Unpaid revolving balance on active credit cards in INR',
    section: 'Existing Finances',
  },
  monthly_expenses: {
    label: 'Monthly Expenses',
    type: 'monetary',
    min: 0,
    max: 50000000,
    step: 'any',
    currency: true,
    description: 'Regular domestic household living expenditures in INR',
    section: 'Existing Finances',
  },
  total_outstanding_debt: {
    label: 'Total Outstanding Debt',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Total principal balance of all active liabilities in INR',
    section: 'Existing Finances',
  },

  // Credit Profile
  credit_score: {
    label: 'Credit Score (CIBIL)',
    type: 'integer',
    min: 300,
    max: 900,
    step: 1,
    description: 'Bureau score ranging strictly between 300 and 900',
    section: 'Credit Profile',
  },
  credit_history_years: {
    label: 'Credit History (Years)',
    type: 'decimal',
    min: 0,
    max: 60,
    step: 'any',
    unit: 'yrs',
    description: 'Age of oldest reported credit line on bureau',
    section: 'Credit Profile',
  },
  active_credit_accounts: {
    label: 'Active Credit Accounts',
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    description: 'Number of open trade-lines reported to bureau',
    section: 'Credit Profile',
  },
  late_payments_12m: {
    label: 'Late Payments (Past 12M)',
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    description: 'Delinquencies or 30+ DPD occurrences in last 12 months',
    section: 'Credit Profile',
  },
  previous_defaults: {
    label: 'Previous Defaults',
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    description: 'Total number of historical defaults, write-offs, or settlements recorded (0–50)',
    section: 'Credit Profile',
  },
  credit_enquiries_6m: {
    label: 'Credit Enquiries (Past 6M)',
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    description: 'Hard inquiries pulled by financial institutions in past 6 months',
    section: 'Credit Profile',
  },
  credit_utilization: {
    label: 'Credit Utilization Ratio',
    type: 'decimal',
    min: 0.0,
    max: 2.0,
    step: 'any',
    unit: 'ratio',
    description: 'Current revolving balance divided by total card limit (e.g. 0.25 = 25%)',
    section: 'Credit Profile',
  },

  // Assets
  savings_balance: {
    label: 'Savings Balance',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Liquid bank balances, savings accounts, and FDs in INR',
    section: 'Assets',
  },
  property_value: {
    label: 'Property Value',
    type: 'monetary',
    min: 0,
    max: 10000000000,
    step: 'any',
    currency: true,
    description: 'Market valuation of residential or commercial properties in INR',
    section: 'Assets',
  },
  vehicle_value: {
    label: 'Vehicle Value',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Estimated market resale value of owned vehicles in INR',
    section: 'Assets',
  },
  investment_value: {
    label: 'Investment Value',
    type: 'monetary',
    min: 0,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Holdings in equities, mutual funds, sovereign bonds, gold in INR',
    section: 'Assets',
  },

  // Loan Request
  loan_amount: {
    label: 'Requested Loan Amount',
    type: 'monetary',
    min: 1000,
    max: 1000000000,
    step: 'any',
    currency: true,
    description: 'Total borrowing facility requested in INR',
    section: 'Loan Request',
  },
  loan_tenure_months: {
    label: 'Loan Tenure (Months)',
    type: 'integer',
    min: 1,
    max: 480,
    step: 1,
    unit: 'mo',
    description: 'Requested repayment horizon in calendar months (1–480)',
    section: 'Loan Request',
  },
  loan_purpose: {
    label: 'Loan Purpose',
    type: 'categorical',
    options: CATEGORICAL_OPTIONS.loan_purpose,
    description: 'Stated financial use of requested loan proceeds',
    section: 'Loan Request',
  },
  annual_interest_rate: {
    label: 'Annual Interest Rate (%)',
    type: 'decimal',
    min: 0.0,
    max: 50.0,
    step: 'any',
    unit: '%',
    description: 'Nominal annual interest rate proposed or quoted',
    section: 'Loan Request',
  },
};

/**
 * Calculates derived features matching backend CatBoost pipeline:
 * - new_loan_emi
 * - total_monthly_debt
 * - total_monthly_income
 * - dti_ratio
 * - foir
 */
export function calculateDerivedFeaturesClient(data) {
  const p = Number(data.loan_amount) || 0;
  const tenure = Number(data.loan_tenure_months) || 12;
  const annualRate = Number(data.annual_interest_rate) || 0;
  const existingEmi = Number(data.existing_emi) || 0;
  const monthlyIncome = Number(data.monthly_income) || 0;
  const coapplicantIncome = Number(data.coapplicant_income) || 0;
  const otherIncome = Number(data.other_monthly_income) || 0;
  const expenses = Number(data.monthly_expenses) || 0;

  const r = annualRate / 12 / 100;
  let new_loan_emi = 0;

  if (r <= 0) {
    new_loan_emi = tenure > 0 ? p / tenure : p;
  } else {
    const compound = Math.pow(1 + r, tenure);
    if (compound === 1 || isNaN(compound)) {
      new_loan_emi = tenure > 0 ? p / tenure : p;
    } else {
      new_loan_emi = (p * r * compound) / (compound - 1);
    }
  }

  const total_monthly_debt = existingEmi + new_loan_emi;
  const total_monthly_income = monthlyIncome + coapplicantIncome + otherIncome;

  const dti_ratio = total_monthly_income > 0 ? total_monthly_debt / total_monthly_income : 1.0;
  const foirDenominator = total_monthly_income - expenses * 0.5;
  const foir = foirDenominator > 0 ? total_monthly_debt / foirDenominator : 2.0;

  return {
    new_loan_emi: Math.round(new_loan_emi * 100) / 100,
    total_monthly_debt: Math.round(total_monthly_debt * 100) / 100,
    total_monthly_income: Math.round(total_monthly_income * 100) / 100,
    dti_ratio: Math.round(dti_ratio * 10000) / 10000,
    foir: Math.round(foir * 10000) / 10000,
  };
}

export const OPTIONAL_FIELDS = new Set([
  'dependents',
  'employment_years',
  'coapplicant_income',
  'other_monthly_income',
  'existing_loan_count',
  'existing_emi',
  'credit_card_outstanding',
  'monthly_expenses',
  'total_outstanding_debt',
  'credit_history_years',
  'active_credit_accounts',
  'late_payments_12m',
  'previous_defaults',
  'credit_enquiries_6m',
  'credit_utilization',
  'savings_balance',
  'property_value',
  'vehicle_value',
  'investment_value',
]);

/**
 * Prepares application payload before sending to backend or validating:
 * Converts blank optional numeric fields into 0 while preserving actual entered values.
 * Required fields left blank remain as empty strings so validation catches them.
 */
export function prepareApplicationPayload(formData) {
  const payload = { ...formData };

  Object.entries(FIELD_METADATA).forEach(([field, meta]) => {
    const rawVal = payload[field];

    if (rawVal === '' || rawVal === undefined || rawVal === null) {
      if (OPTIONAL_FIELDS.has(field)) {
        payload[field] = 0;
      }
    } else if (meta.type === 'integer') {
      const parsed = parseInt(rawVal, 10);
      payload[field] = isNaN(parsed) ? rawVal : parsed;
    } else if (meta.type === 'decimal' || meta.type === 'monetary') {
      const parsed = parseFloat(rawVal);
      payload[field] = isNaN(parsed) ? rawVal : parsed;
    }
  });

  return payload;
}

/**
 * Validates full applicant form
 * Accepts every logically valid value; rejects only genuinely invalid values.
 */
export function validateApplication(data) {
  const errors = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Application payload is empty or malformed.' },
    };
  }

  // Validate all metadata fields
  Object.entries(FIELD_METADATA).forEach(([field, meta]) => {
    let rawVal = data[field];

    // If an optional field is empty, it converts to 0 at submission time
    if (rawVal === undefined || rawVal === null || rawVal === '') {
      if (OPTIONAL_FIELDS.has(field)) {
        rawVal = 0;
      } else {
        errors[field] = `${meta.label} is required.`;
        return;
      }
    }

    if (meta.options) {
      if (!meta.options.map(String).includes(String(rawVal))) {
        errors[field] = `Please select a valid option for ${meta.label}.`;
      }
      return;
    }

    const num = Number(rawVal);
    if (!Number.isFinite(num) || isNaN(num)) {
      errors[field] = `${meta.label} must be a valid number.`;
      return;
    }

    // Integer enforcement for discrete count/years fields
    if (meta.type === 'integer' && !Number.isInteger(num)) {
      errors[field] = `${meta.label} must be a whole number.`;
      return;
    }

    // Minimum check (prevents negative amounts, zero loan, impossible age)
    if (meta.min !== undefined && num < meta.min) {
      if (meta.min === 0) {
        errors[field] = `${meta.label} cannot be negative.`;
      } else {
        errors[field] = `${meta.label} cannot be less than ${meta.min}.`;
      }
      return;
    }

    // Maximum check
    if (meta.max !== undefined && num > meta.max) {
      errors[field] = `${meta.label} cannot exceed ${meta.max}.`;
      return;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Currency formatter for INR
 */
export function formatINR(val, compact = false) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const num = Number(val);

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')} k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}
