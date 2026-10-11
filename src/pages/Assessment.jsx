import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Wallet, 
  Award, 
  Building2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Info, 
  CreditCard, 
  Briefcase, 
  Layers, 
  Calculator, 
  ShieldCheck, 
  Percent 
} from 'lucide-react';
import { 
  FIELD_METADATA, 
  CATEGORICAL_OPTIONS, 
  validateApplication, 
  prepareApplicationPayload,
  calculateDerivedFeaturesClient, 
  formatINR 
} from '../utils/validation';

export const EMPTY_FORM_STATE = {
  age: '',
  gender: 'Male',
  marital_status: 'Single',
  dependents: '',
  education: 'Graduate',
  employment_type: 'Salaried',
  employment_years: '',
  city_tier: 'Tier 1',
  monthly_income: '',
  coapplicant_income: '',
  other_monthly_income: '',
  existing_loan_count: '',
  existing_emi: '',
  credit_card_outstanding: '',
  monthly_expenses: '',
  total_outstanding_debt: '',
  credit_score: '',
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
  loan_amount: '',
  loan_tenure_months: '',
  loan_purpose: 'Personal',
  annual_interest_rate: '',
};

// Presets from KnowYourLoan_Final.ipynb test cases
const PRESETS = {
  strong: {
    name: 'Prime Applicant (Strong)',
    description: 'High credit score (790), healthy FOIR (27%), positive savings, clean history.',
    data: {
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
    }
  },
  borderline: {
    name: 'Borderline Applicant',
    description: 'Moderate credit score (680), 1 late payment, higher debt, near 0.45 decision boundary.',
    data: {
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
    }
  },
  weak: {
    name: 'Subprime Applicant (Weak)',
    description: 'Low credit score (520), 4 late payments, 1 past default, high FOIR, contract role.',
    data: {
      age: 27,
      gender: 'Male',
      marital_status: 'Single',
      dependents: 2,
      education: 'Graduate',
      employment_type: 'Contract',
      employment_years: 2,
      city_tier: 'Tier 2',
      monthly_income: 40000,
      coapplicant_income: 0,
      other_monthly_income: 0,
      existing_loan_count: 3,
      existing_emi: 14000,
      credit_card_outstanding: 70000,
      monthly_expenses: 22000,
      total_outstanding_debt: 800000,
      credit_score: 520,
      credit_history_years: 4,
      active_credit_accounts: 6,
      late_payments_12m: 4,
      previous_defaults: 1,
      credit_enquiries_6m: 6,
      credit_utilization: 0.82,
      savings_balance: 30000,
      property_value: 0,
      vehicle_value: 250000,
      investment_value: 0,
      loan_amount: 2000000,
      loan_tenure_months: 60,
      loan_purpose: 'Personal',
      annual_interest_rate: 13.5
    }
  }
};

export default function Assessment({ onStartAssessment, isProcessing }) {
  const [formData, setFormData] = useState(EMPTY_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Real-time client derived features
  const derived = useMemo(() => {
    return calculateDerivedFeaturesClient(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const payload = prepareApplicationPayload(formData);
    const result = validateApplication(payload);
    if (result.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
    }
  };

  const loadPreset = (key) => {
    if (PRESETS[key]) {
      setFormData({ ...PRESETS[key].data });
      setErrors({});
      setTouched({});
    }
  };

  const handleResetForm = () => {
    setFormData({ ...EMPTY_FORM_STATE });
    setErrors({});
    setTouched({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = prepareApplicationPayload(formData);
    const validation = validateApplication(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const touchedMap = {};
      Object.keys(validation.errors).forEach((k) => { touchedMap[k] = true; });
      setTouched(touchedMap);

      const firstErrorKey = Object.keys(validation.errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onStartAssessment(payload);
  };

  // Helper parser for numeric inputs: keeps blank strings as empty, parses numbers cleanly without truncating decimals
  const parseVal = (raw) => {
    if (raw === '' || raw === undefined || raw === null) return '';
    const num = Number(raw);
    return isNaN(num) ? raw : num;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Production Underwriting Model • CatBoost 35 Features</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-['Cinzel',serif] tracking-tight">
          Loan Application Assessment
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Enter applicant details below. Our calibrated CatBoost model predicts approval likelihood with an exact 0.45 decision threshold, followed by full SHAP explainability.
        </p>

        {/* Quick Presets */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <span className="text-zinc-500 mr-1">Benchmarked Profiles:</span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadPreset(key)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {item.name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center space-x-1.5"
            title="Clear all numeric inputs back to empty"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Form with noValidate to prevent restrictive browser step popups */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        
        {/* SECTION 1: PERSONAL & EMPLOYMENT */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-emerald-950/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cinzel',serif]">1. Personal & Employment Profile</h2>
              <p className="text-xs text-zinc-400">Demographic details and professional stability metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Age */}
            <div id="field-age" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Age (Years)</span>
                <span className="text-zinc-500">18–100</span>
              </label>
              <input
                type="number"
                min={18}
                max={100}
                step={1}
                value={formData.age}
                onChange={(e) => handleChange('age', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('age')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.age && errors.age && <p className="text-red-400 text-xs font-mono">{errors.age}</p>}
            </div>

            {/* Gender */}
            <div id="field-gender" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.gender.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div id="field-marital_status" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Marital Status</label>
              <select
                value={formData.marital_status}
                onChange={(e) => handleChange('marital_status', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.marital_status.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Dependents */}
            <div id="field-dependents" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Dependents</span>
                <span className="text-zinc-500">0–20</span>
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={1}
                value={formData.dependents}
                onChange={(e) => handleChange('dependents', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('dependents')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.dependents && errors.dependents && <p className="text-red-400 text-xs font-mono">{errors.dependents}</p>}
            </div>

            {/* Education */}
            <div id="field-education" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Education</label>
              <select
                value={formData.education}
                onChange={(e) => handleChange('education', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.education.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div id="field-employment_type" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Employment Type</label>
              <select
                value={formData.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.employment_type.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Employment Years */}
            <div id="field-employment_years" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Experience</span>
                <span className="text-zinc-500">Years</span>
              </label>
              <input
                type="number"
                min={0}
                max={60}
                step="any"
                value={formData.employment_years}
                onChange={(e) => handleChange('employment_years', parseVal(e.target.value))}
                onBlur={() => handleBlur('employment_years')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.employment_years && errors.employment_years && <p className="text-red-400 text-xs font-mono">{errors.employment_years}</p>}
            </div>

            {/* City Tier */}
            <div id="field-city_tier" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">City Tier</label>
              <select
                value={formData.city_tier}
                onChange={(e) => handleChange('city_tier', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.city_tier.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* SECTION 2: INCOME & EXISTING OBLIGATIONS */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-emerald-950/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cinzel',serif]">2. Income & Existing Debt Obligations</h2>
              <p className="text-xs text-zinc-400">Current monthly cashflow, ongoing EMIs, and existing liabilities</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Monthly Income */}
            <div id="field-monthly_income" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Monthly Income (INR)</span>
                <span className="text-emerald-400">{formatINR(formData.monthly_income, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.monthly_income}
                onChange={(e) => handleChange('monthly_income', parseVal(e.target.value))}
                onBlur={() => handleBlur('monthly_income')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.monthly_income && errors.monthly_income && <p className="text-red-400 text-xs font-mono">{errors.monthly_income}</p>}
            </div>

            {/* Coapplicant Income */}
            <div id="field-coapplicant_income" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Co-Applicant Income</span>
                <span className="text-emerald-400">{formatINR(formData.coapplicant_income, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.coapplicant_income}
                onChange={(e) => handleChange('coapplicant_income', parseVal(e.target.value))}
                onBlur={() => handleBlur('coapplicant_income')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.coapplicant_income && errors.coapplicant_income && <p className="text-red-400 text-xs font-mono">{errors.coapplicant_income}</p>}
            </div>

            {/* Other Monthly Income */}
            <div id="field-other_monthly_income" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Other Monthly Income</span>
                <span className="text-emerald-400">{formatINR(formData.other_monthly_income, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.other_monthly_income}
                onChange={(e) => handleChange('other_monthly_income', parseVal(e.target.value))}
                onBlur={() => handleBlur('other_monthly_income')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.other_monthly_income && errors.other_monthly_income && <p className="text-red-400 text-xs font-mono">{errors.other_monthly_income}</p>}
            </div>

            {/* Existing Loan Count */}
            <div id="field-existing_loan_count" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Existing Loans Count</label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={formData.existing_loan_count}
                onChange={(e) => handleChange('existing_loan_count', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('existing_loan_count')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.existing_loan_count && errors.existing_loan_count && <p className="text-red-400 text-xs font-mono">{errors.existing_loan_count}</p>}
            </div>

            {/* Existing Monthly EMI */}
            <div id="field-existing_emi" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Existing Monthly EMI</span>
                <span className="text-emerald-400">{formatINR(formData.existing_emi, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.existing_emi}
                onChange={(e) => handleChange('existing_emi', parseVal(e.target.value))}
                onBlur={() => handleBlur('existing_emi')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.existing_emi && errors.existing_emi && <p className="text-red-400 text-xs font-mono">{errors.existing_emi}</p>}
            </div>

            {/* Credit Card Outstanding */}
            <div id="field-credit_card_outstanding" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Card Outstanding</span>
                <span className="text-emerald-400">{formatINR(formData.credit_card_outstanding, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.credit_card_outstanding}
                onChange={(e) => handleChange('credit_card_outstanding', parseVal(e.target.value))}
                onBlur={() => handleBlur('credit_card_outstanding')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.credit_card_outstanding && errors.credit_card_outstanding && <p className="text-red-400 text-xs font-mono">{errors.credit_card_outstanding}</p>}
            </div>

            {/* Monthly Expenses */}
            <div id="field-monthly_expenses" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Monthly Living Expenses</span>
                <span className="text-emerald-400">{formatINR(formData.monthly_expenses, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.monthly_expenses}
                onChange={(e) => handleChange('monthly_expenses', parseVal(e.target.value))}
                onBlur={() => handleBlur('monthly_expenses')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.monthly_expenses && errors.monthly_expenses && <p className="text-red-400 text-xs font-mono">{errors.monthly_expenses}</p>}
            </div>

            {/* Total Outstanding Debt */}
            <div id="field-total_outstanding_debt" className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Total Outstanding Principal Debt</span>
                <span className="text-emerald-400">{formatINR(formData.total_outstanding_debt, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.total_outstanding_debt}
                onChange={(e) => handleChange('total_outstanding_debt', parseVal(e.target.value))}
                onBlur={() => handleBlur('total_outstanding_debt')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.total_outstanding_debt && errors.total_outstanding_debt && <p className="text-red-400 text-xs font-mono">{errors.total_outstanding_debt}</p>}
            </div>

          </div>
        </div>

        {/* SECTION 3: CREDIT PROFILE & ASSETS */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-emerald-950/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cinzel',serif]">3. Credit Bureau Profile & Assets</h2>
              <p className="text-xs text-zinc-400">Bureau track record, delinquencies, utilization, and tangible collateral</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Credit Score */}
            <div id="field-credit_score" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Credit Score (CIBIL)</span>
                <span className="text-emerald-400 font-bold">{formData.credit_score}</span>
              </label>
              <input
                type="number"
                min={300}
                max={900}
                step={1}
                value={formData.credit_score}
                onChange={(e) => handleChange('credit_score', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('credit_score')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono text-emerald-300 font-bold"
              />
              {touched.credit_score && errors.credit_score && <p className="text-red-400 text-xs font-mono">{errors.credit_score}</p>}
            </div>

            {/* Credit History Years */}
            <div id="field-credit_history_years" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Credit History (Yrs)</label>
              <input
                type="number"
                min={0}
                max={60}
                step="any"
                value={formData.credit_history_years}
                onChange={(e) => handleChange('credit_history_years', parseVal(e.target.value))}
                onBlur={() => handleBlur('credit_history_years')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.credit_history_years && errors.credit_history_years && <p className="text-red-400 text-xs font-mono">{errors.credit_history_years}</p>}
            </div>

            {/* Active Credit Accounts */}
            <div id="field-active_credit_accounts" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Active Accounts</label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={formData.active_credit_accounts}
                onChange={(e) => handleChange('active_credit_accounts', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('active_credit_accounts')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.active_credit_accounts && errors.active_credit_accounts && <p className="text-red-400 text-xs font-mono">{errors.active_credit_accounts}</p>}
            </div>

            {/* Late Payments 12m */}
            <div id="field-late_payments_12m" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Late Payments (12M)</span>
                <span className={formData.late_payments_12m > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {formData.late_payments_12m}
                </span>
              </label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={formData.late_payments_12m}
                onChange={(e) => handleChange('late_payments_12m', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('late_payments_12m')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.late_payments_12m && errors.late_payments_12m && <p className="text-red-400 text-xs font-mono">{errors.late_payments_12m}</p>}
            </div>

            {/* Previous Defaults */}
            <div id="field-previous_defaults" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Previous Defaults</span>
                <span className="text-zinc-500">0–50</span>
              </label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={formData.previous_defaults}
                onChange={(e) => handleChange('previous_defaults', parseVal(e.target.value))}
                onBlur={() => handleBlur('previous_defaults')}
                placeholder="0"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.previous_defaults && errors.previous_defaults && (
                <p className="text-red-400 text-xs font-mono">{errors.previous_defaults}</p>
              )}
            </div>

            {/* Credit Enquiries 6m */}
            <div id="field-credit_enquiries_6m" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Enquiries (6M)</label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={formData.credit_enquiries_6m}
                onChange={(e) => handleChange('credit_enquiries_6m', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('credit_enquiries_6m')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.credit_enquiries_6m && errors.credit_enquiries_6m && <p className="text-red-400 text-xs font-mono">{errors.credit_enquiries_6m}</p>}
            </div>

            {/* Credit Utilization */}
            <div id="field-credit_utilization" className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Credit Utilization (Ratio)</span>
                <span className="text-emerald-400">{(formData.credit_utilization * 100).toFixed(1)}%</span>
              </label>
              <input
                type="number"
                min={0}
                max={2.0}
                step="any"
                value={formData.credit_utilization}
                onChange={(e) => handleChange('credit_utilization', parseVal(e.target.value))}
                onBlur={() => handleBlur('credit_utilization')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.credit_utilization && errors.credit_utilization && <p className="text-red-400 text-xs font-mono">{errors.credit_utilization}</p>}
            </div>

            {/* Savings Balance */}
            <div id="field-savings_balance" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Savings Balance</span>
                <span className="text-emerald-400">{formatINR(formData.savings_balance, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.savings_balance}
                onChange={(e) => handleChange('savings_balance', parseVal(e.target.value))}
                onBlur={() => handleBlur('savings_balance')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.savings_balance && errors.savings_balance && <p className="text-red-400 text-xs font-mono">{errors.savings_balance}</p>}
            </div>

            {/* Property Value */}
            <div id="field-property_value" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Property Value</span>
                <span className="text-emerald-400">{formatINR(formData.property_value, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.property_value}
                onChange={(e) => handleChange('property_value', parseVal(e.target.value))}
                onBlur={() => handleBlur('property_value')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.property_value && errors.property_value && <p className="text-red-400 text-xs font-mono">{errors.property_value}</p>}
            </div>

            {/* Vehicle Value */}
            <div id="field-vehicle_value" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Vehicle Value</span>
                <span className="text-emerald-400">{formatINR(formData.vehicle_value, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.vehicle_value}
                onChange={(e) => handleChange('vehicle_value', parseVal(e.target.value))}
                onBlur={() => handleBlur('vehicle_value')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.vehicle_value && errors.vehicle_value && <p className="text-red-400 text-xs font-mono">{errors.vehicle_value}</p>}
            </div>

            {/* Investment Value */}
            <div id="field-investment_value" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Investments Value</span>
                <span className="text-emerald-400">{formatINR(formData.investment_value, true)}</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.investment_value}
                onChange={(e) => handleChange('investment_value', parseVal(e.target.value))}
                onBlur={() => handleBlur('investment_value')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.investment_value && errors.investment_value && <p className="text-red-400 text-xs font-mono">{errors.investment_value}</p>}
            </div>

          </div>
        </div>

        {/* SECTION 4: REQUESTED LOAN PARAMETERS */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-emerald-950/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cinzel',serif]">4. Requested Loan Facility</h2>
              <p className="text-xs text-zinc-400">Loan principal, tenure, purpose and proposed interest rate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Loan Amount */}
            <div id="field-loan_amount" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Loan Amount</span>
                <span className="text-emerald-400 font-bold">{formatINR(formData.loan_amount, true)}</span>
              </label>
              <input
                type="number"
                min={1000}
                step="any"
                value={formData.loan_amount}
                onChange={(e) => handleChange('loan_amount', parseVal(e.target.value))}
                onBlur={() => handleBlur('loan_amount')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono text-emerald-300 font-bold"
              />
              {touched.loan_amount && errors.loan_amount && <p className="text-red-400 text-xs font-mono">{errors.loan_amount}</p>}
            </div>

            {/* Loan Tenure Months */}
            <div id="field-loan_tenure_months" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Tenure (Months)</span>
                <span className="text-zinc-400 font-mono">{(formData.loan_tenure_months / 12).toFixed(1)} Yrs</span>
              </label>
              <input
                type="number"
                min={1}
                max={480}
                step={1}
                value={formData.loan_tenure_months}
                onChange={(e) => handleChange('loan_tenure_months', parseVal(e.target.value, true))}
                onBlur={() => handleBlur('loan_tenure_months')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              />
              {touched.loan_tenure_months && errors.loan_tenure_months && <p className="text-red-400 text-xs font-mono">{errors.loan_tenure_months}</p>}
            </div>

            {/* Loan Purpose */}
            <div id="field-loan_purpose" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Loan Purpose</label>
              <select
                value={formData.loan_purpose}
                onChange={(e) => handleChange('loan_purpose', e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm bg-[#080e0b]"
              >
                {CATEGORICAL_OPTIONS.loan_purpose.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Annual Interest Rate */}
            <div id="field-annual_interest_rate" className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Interest Rate (%)</span>
                <span className="text-emerald-400 font-mono">{formData.annual_interest_rate}% p.a.</span>
              </label>
              <input
                type="number"
                min={0}
                max={50.0}
                step="any"
                value={formData.annual_interest_rate}
                onChange={(e) => handleChange('annual_interest_rate', parseVal(e.target.value))}
                onBlur={() => handleBlur('annual_interest_rate')}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono"
              />
              {touched.annual_interest_rate && errors.annual_interest_rate && <p className="text-red-400 text-xs font-mono">{errors.annual_interest_rate}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 5: DERIVED FEATURES AUTOMATIC COMPUTATION PANEL */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#07130d] to-[#040a06] border border-emerald-500/25 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-950/60">
            <div className="flex items-center space-x-2.5">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-300 uppercase font-mono tracking-wider">
                Automated Underwriting Derived Features
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Computed automatically • Not manually entered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-950/60 space-y-1">
              <span className="text-zinc-500 block text-[10px] uppercase">New Loan EMI</span>
              <span className="text-white font-bold text-sm sm:text-base">
                {formatINR(derived.new_loan_emi)}
              </span>
              <span className="text-[10px] text-zinc-500 block">Amortized monthly outflow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-950/60 space-y-1">
              <span className="text-zinc-500 block text-[10px] uppercase">Total Monthly Debt</span>
              <span className="text-white font-bold text-sm sm:text-base">
                {formatINR(derived.total_monthly_debt)}
              </span>
              <span className="text-[10px] text-zinc-500 block">Existing EMI + New EMI</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-950/60 space-y-1">
              <span className="text-zinc-500 block text-[10px] uppercase">DTI Ratio</span>
              <span className={`font-bold text-sm sm:text-base ${derived.total_monthly_income > 0 && derived.dti_ratio > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {derived.total_monthly_income > 0 ? `${(derived.dti_ratio * 100).toFixed(1)}%` : '—'}
              </span>
              <span className="text-[10px] text-zinc-500 block">Total Debt / Total Income</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-950/60 space-y-1">
              <span className="text-zinc-500 block text-[10px] uppercase">FOIR Ratio</span>
              <span className={`font-bold text-sm sm:text-base ${derived.total_monthly_income > 0 && derived.foir > 0.6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {derived.total_monthly_income > 0 ? `${(derived.foir * 100).toFixed(1)}%` : '—'}
              </span>
              <span className="text-[10px] text-zinc-500 block">Fixed Obligation to Income</span>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>35 Features Pipeline • Decision Boundary: 0.45 • Pure Machine Learning</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-4 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl transition-all cursor-pointer flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans tracking-wide"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin mr-2.5" />
                  <span>Processing Application...</span>
                </>
              ) : (
                <>
                  <span>Assess My Application</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
