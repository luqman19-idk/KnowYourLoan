import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  Wallet,
  Building,
  CreditCard,
  FileText,
  Send,
  History,
  Cpu,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import {
  fetchApplicationDetail,
  updateReviewStatusApi,
  addReviewNoteApi,
  overrideDecisionApi
} from './api';

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function ApplicationDetail({ appId, onBack, adminUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status modal/action
  const [statusActionNote, setStatusActionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Override form
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState('MANUAL_APPROVED');
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApplicationDetail(appId);
      setData(res);
    } catch (err) {
      setError(err.message || `Failed to retrieve application ${appId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appId]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateReviewStatusApi(appId, newStatus, statusActionNote || undefined);
      setStatusActionNote('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await addReviewNoteApi(appId, newNote.trim());
      setNewNote('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('Please provide a mandatory justification reason for the manual decision override.');
      return;
    }
    const confirmed = window.confirm(
      `Confirm manual decision override to '${overrideDecision}'?\nThis action will be permanently recorded in the immutable audit log under administrator '${adminUser?.username}'.`
    );
    if (!confirmed) return;

    setSubmittingOverride(true);
    try {
      await overrideDecisionApi(appId, overrideDecision, overrideReason.trim());
      setShowOverrideForm(false);
      setOverrideReason('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Override failed');
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-[#929B9C]">
        Loading application {appId} details from SQLite...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs space-y-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="font-semibold text-sm">{error || 'Application not found'}</span>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] hover:bg-[#141818]"
        >
          ← Return to List
        </button>
      </div>
    );
  }

  const applicant = data.applicant_data || {};
  const derived = data.derived_features || {};
  const shapExp = data.shap_explanation || {};
  const isApproved = data.model_prediction === 'APPROVED';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#252C2C]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#141818] border border-[#252C2C] text-[#929B9C] hover:text-[#E1E5E6] hover:bg-[#0E1111] transition-colors cursor-pointer"
            title="Back to applications"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold font-mono text-[#E1E5E6]">
                {data.id}
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                data.review_status === 'REVIEWED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {data.review_status}
              </span>
              {data.manual_override_status && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  OVERRIDE: {data.manual_override_status}
                </span>
              )}
            </div>
            <p className="text-xs text-[#929B9C] mt-0.5">
              Submitted: {data.created_at ? data.created_at.replace('T', ' ').slice(0, 19) : '—'} UTC
            </p>
          </div>
        </div>

        {/* Quick Review Status Actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {data.review_status === 'REVIEWED' ? (
            <button
              onClick={() => handleUpdateStatus('PENDING REVIEW')}
              disabled={updatingStatus}
              className="px-4 py-2 rounded-lg bg-[#141818] hover:bg-[#252C2C] border border-[#252C2C] text-amber-300 font-semibold text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              {updatingStatus ? 'Updating...' : 'Move to PENDING REVIEW'}
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('REVIEWED')}
              disabled={updatingStatus}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090B0B] font-semibold text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              {updatingStatus ? 'Updating...' : 'Mark as REVIEWED'}
            </button>
          )}

          <button
            onClick={() => setShowOverrideForm(!showOverrideForm)}
            className="px-3 py-2 rounded-lg bg-[#141818] hover:bg-[#252C2C] border border-[#252C2C] text-[#C0C7C9] text-xs font-mono transition-colors cursor-pointer"
          >
            {showOverrideForm ? 'Close Override Form' : 'Manual Override'}
          </button>
        </div>
      </div>

      {/* Manual Override Banner / Drawer */}
      {showOverrideForm && (
        <div className="bg-[#141818] border border-amber-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider">
              Administrative Decision Override
            </h3>
          </div>
          <p className="text-xs text-[#929B9C] max-w-2xl leading-relaxed">
            <strong>Mandatory Underwriting Protocol:</strong> The original CatBoost machine learning prediction (
            <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{data.model_prediction}</span>
            ) will NEVER be modified or erased. A manual override creates a separate administrative classification with required justification and immutable audit logging.
          </p>

          <form onSubmit={handleOverrideSubmit} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#929B9C] mb-1">Override Decision</label>
                <select
                  value={overrideDecision}
                  onChange={(e) => setOverrideDecision(e.target.value)}
                  className="w-full p-2 rounded bg-[#0E1111] border border-[#252C2C] text-xs text-[#E1E5E6] font-mono focus:outline-none focus:border-amber-500/60"
                >
                  <option value="MANUAL_APPROVED">MANUAL_APPROVED (Administrative Exception)</option>
                  <option value="MANUAL_REJECTED">MANUAL_REJECTED (Underwriting Decline)</option>
                  <option value="RESET">RESET OVERRIDE (Clear Exception)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#929B9C] mb-1">
                  Justification / Lending Committee Reason (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Validated liquid fixed deposits exceed loan principal; co-borrower adds 50k..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2 rounded bg-[#0E1111] border border-[#252C2C] text-xs text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideForm(false)}
                className="px-3 py-1.5 rounded bg-[#0E1111] text-xs font-mono text-[#929B9C] hover:text-[#E1E5E6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOverride}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-[#090B0B] text-xs font-bold font-mono transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingOverride ? 'Recording Audit...' : 'Execute Override'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 1: MODEL ASSESSMENT & PREDICTION SUMMARY */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#929B9C]">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>CATBOOST ML PREDICTION (THRESHOLD: 0.45)</span>
            </div>
            <div className="flex items-center space-x-3">
              {isApproved ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <h3 className="text-3xl font-black text-[#E1E5E6] font-['Cinzel',serif] tracking-tight">
                {data.model_prediction}
              </h3>
            </div>
            <p className="text-xs text-[#929B9C] max-w-xl">
              Model output probability of <strong className="text-[#E1E5E6]">{(data.approval_probability * 100).toFixed(2)}%</strong> against decision boundary of <strong className="text-[#E1E5E6]">45.0%</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-center border-t md:border-t-0 md:border-l border-[#252C2C] pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-2xl font-bold font-mono text-[#E1E5E6]">
                {(data.approval_probability * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#929B9C] font-mono uppercase mt-0.5">
                Approval Prob
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-[#C0C7C9]">
                0.45
              </div>
              <div className="text-[10px] text-[#929B9C] font-mono uppercase mt-0.5">
                Boundary
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {((derived.foir || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#929B9C] font-mono uppercase mt-0.5">
                FOIR
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GRID OF PROFILES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Applicant Profile */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
            <User className="w-4 h-4" />
            <span className="uppercase">Applicant Profile</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Age & Gender</span>
              <span className="text-[#E1E5E6] font-semibold">{applicant.age} yrs • {applicant.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Marital Status</span>
              <span className="text-[#E1E5E6]">{applicant.marital_status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Dependents</span>
              <span className="text-[#E1E5E6]">{applicant.dependents}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Education</span>
              <span className="text-[#E1E5E6]">{applicant.education}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Employment</span>
              <span className="text-[#E1E5E6]">{applicant.employment_type} ({applicant.employment_years} yrs)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#929B9C]">City Classification</span>
              <span className="text-emerald-400 font-semibold">{applicant.city_tier}</span>
            </div>
          </div>
        </div>

        {/* Financial & Assets Profile */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
            <Wallet className="w-4 h-4" />
            <span className="uppercase">Financial & Assets</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Primary Income</span>
              <span className="text-[#E1E5E6] font-semibold">{formatINR(applicant.monthly_income)}/mo</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Co-applicant / Other</span>
              <span className="text-[#E1E5E6]">{formatINR(applicant.coapplicant_income)} / {formatINR(applicant.other_monthly_income)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Monthly Expenses</span>
              <span className="text-[#E1E5E6]">{formatINR(applicant.monthly_expenses)}/mo</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Existing EMI Obligations</span>
              <span className="text-[#E1E5E6]">{formatINR(applicant.existing_emi)} ({applicant.existing_loan_count} loans)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Liquid Savings</span>
              <span className="text-emerald-400 font-semibold">{formatINR(applicant.savings_balance)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#929B9C]">Property + Vehicle + Invest</span>
              <span className="text-[#E1E5E6]">{formatINR((applicant.property_value || 0) + (applicant.vehicle_value || 0) + (applicant.investment_value || 0))}</span>
            </div>
          </div>
        </div>

        {/* Credit & Derived Metrics */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
            <CreditCard className="w-4 h-4" />
            <span className="uppercase">Credit Risk & Ratios</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">CIBIL Credit Score</span>
              <span className="text-[#E1E5E6] font-bold text-sm">{applicant.credit_score}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Credit History Length</span>
              <span className="text-[#E1E5E6]">{applicant.credit_history_years} years ({applicant.active_credit_accounts} lines)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Late Payments (12M)</span>
              <span className={Number(applicant.late_payments_12m) > 0 ? 'text-amber-400 font-semibold' : 'text-[#E1E5E6]'}>
                {applicant.late_payments_12m !== undefined && applicant.late_payments_12m !== null && applicant.late_payments_12m !== ''
                  ? applicant.late_payments_12m
                  : 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Previous Defaults</span>
              <span className={Number(applicant.previous_defaults) > 0 ? 'text-red-400 font-bold' : 'text-[#E1E5E6]'}>
                {applicant.previous_defaults !== undefined && applicant.previous_defaults !== null && applicant.previous_defaults !== ''
                  ? `${applicant.previous_defaults} defaults`
                  : '0 defaults'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Credit Card Utilization</span>
              <span className="text-[#E1E5E6]">{((applicant.credit_utilization || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252C2C]/50">
              <span className="text-[#929B9C]">Calculated New Loan EMI</span>
              <span className="text-emerald-400 font-semibold">{formatINR(derived.new_loan_emi)}/mo</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#929B9C]">DTI / FOIR Ratios</span>
              <span className="text-emerald-400 font-bold">
                {((derived.dti_ratio || 0) * 100).toFixed(1)}% / {((derived.foir || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: REQUESTED LOAN SUMMARY */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2 mb-4">
          <Building className="w-4 h-4" />
          <span className="uppercase">Requested Loan Details</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono text-center">
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] block text-[10px] uppercase">Loan Amount</span>
            <span className="text-sm font-bold text-emerald-400">{formatINR(applicant.loan_amount)}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] block text-[10px] uppercase">Purpose</span>
            <span className="text-sm font-bold text-[#E1E5E6]">{applicant.loan_purpose}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] block text-[10px] uppercase">Tenure</span>
            <span className="text-sm font-bold text-[#E1E5E6]">{applicant.loan_tenure_months} months</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] block text-[10px] uppercase">Interest Rate</span>
            <span className="text-sm font-bold text-[#E1E5E6]">{applicant.annual_interest_rate}%</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] block text-[10px] uppercase">Calculated EMI</span>
            <span className="text-sm font-bold text-emerald-400">{formatINR(derived.new_loan_emi)}</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: SHAP EXPLAINABILITY BREAKDOWN */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252C2C] pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-[#E1E5E6] uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>SHAP Feature Attribution (TreeExplainer)</span>
            </h3>
            <p className="text-xs text-[#929B9C] mt-0.5">
              Exact mathematical log-odds impacts calculated for this specific applicant.
            </p>
          </div>
          <span className="text-xs font-mono text-[#929B9C] bg-[#0E1111] px-2.5 py-1 rounded border border-[#252C2C]">
            Base Log-Odds: {shapExp.base_value ?? '—'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Positive Factors */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase">
              <TrendingUp className="w-4 h-4" />
              <span>Positive Approval Drivers (+SHAP)</span>
            </div>

            {(!shapExp.positive_factors || shapExp.positive_factors.length === 0) ? (
              <p className="text-xs text-[#929B9C] italic">No positive attributions found for this record.</p>
            ) : (
              <div className="space-y-2">
                {shapExp.positive_factors.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0E1111] border border-emerald-500/20 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#E1E5E6]">{f.label || f.feature}</div>
                      <div className="text-[11px] text-[#929B9C]">Value: {f.value}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">+{f.shap_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Negative Factors */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-red-400 font-bold uppercase">
              <TrendingDown className="w-4 h-4" />
              <span>Negative Risk Drivers (-SHAP)</span>
            </div>

            {(!shapExp.negative_factors || shapExp.negative_factors.length === 0) ? (
              <p className="text-xs text-[#929B9C] italic">No negative risk drivers found for this record.</p>
            ) : (
              <div className="space-y-2">
                {shapExp.negative_factors.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0E1111] border border-red-500/20 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#E1E5E6]">{f.label || f.feature}</div>
                      <div className="text-[11px] text-[#929B9C]">Value: {f.value}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-bold">{f.shap_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: INTERNAL REVIEW NOTES & AUDIT TRAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Internal Review Notes */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#E1E5E6] font-semibold border-b border-[#252C2C] pb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="uppercase">Internal Underwriting Notes</span>
            </div>

            <div className="space-y-2.5 mt-3 max-h-56 overflow-y-auto pr-1">
              {(!data.review_notes || data.review_notes.length === 0) ? (
                <p className="text-xs text-[#929B9C] italic py-4 text-center">
                  No notes recorded yet. Add internal remarks below.
                </p>
              ) : (
                data.review_notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C] text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[#929B9C] text-[10px]">
                      <span className="font-semibold text-emerald-400">{note.admin_username}</span>
                      <span>{note.created_at?.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <p className="text-[#E1E5E6] whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-[#252C2C]">
            <textarea
              rows={2}
              required
              placeholder="Add underwriter note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-xs text-[#E1E5E6] placeholder-[#929B9C]/50 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#090B0B] text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingNote ? 'Saving...' : 'Add Note'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Audit Trail for this Application */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#E1E5E6] font-semibold border-b border-[#252C2C] pb-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span className="uppercase">Application Audit History</span>
          </div>

          <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
            {(!data.audit_history || data.audit_history.length === 0) ? (
              <p className="text-xs text-[#929B9C] italic py-4 text-center">
                No administrative actions recorded on this file.
              </p>
            ) : (
              data.audit_history.map((h) => (
                <div key={h.id} className="p-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-300">{h.action}</span>
                    <span className="text-[#929B9C]">{h.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                  <div className="text-[11px] text-[#C0C7C9]">
                    By: <strong className="text-[#E1E5E6]">{h.admin_username}</strong>
                  </div>
                  {h.details && (
                    <p className="text-[11px] text-[#929B9C]">{h.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
