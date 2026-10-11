import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Activity,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '../utils/validation';

export default function Result({ assessmentResult, onNewAssessment }) {
  const [animatedProb, setAnimatedProb] = useState(0);

  const {
    prediction,
    probability,
    probability_percentage,
    threshold = 0.45,
    threshold_percentage = 45.0,
    derived_features = {},
    explanation = {},
    rawApplication = {},
  } = assessmentResult;

  // Animate the main probability counter
  useEffect(() => {
    let start = 0;
    const target = probability_percentage !== undefined ? probability_percentage : probability * 100;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedProb(target);
        clearInterval(timer);
        if (prediction === 'APPROVED' && target >= 60) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#34D399', '#059669', '#10B981', '#E6ECE8'],
          });
        }
      } else {
        setAnimatedProb(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [probability, probability_percentage, prediction]);

  const isApproved = prediction === 'APPROVED';

  // Radial chart dimensions
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProb / 100) * circumference;

  // SHAP factors breakdown
  const positiveFactors = explanation?.positive_factors || [];
  const negativeFactors = explanation?.negative_factors || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-12">
      
      {/* ==============================================================
          1. PROMINENT MODEL DECISION CARD
          ============================================================== */}
      <div className={`glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden ${isApproved ? 'emerald-glow' : 'shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}>
        
        {/* Glow accent */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isApproved ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-4 text-center md:text-left flex-1">
            
            {/* Header tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                MODEL PREDICTION
              </span>
              {assessmentResult.application_id && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-zinc-900/80 text-emerald-400 border border-emerald-500/30">
                    APP ID: {assessmentResult.application_id}
                  </span>
                </>
              )}
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-zinc-400">
                Decision Threshold: {(threshold * 100).toFixed(1)}%
              </span>
            </div>

            {/* Decision Status Headline */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              {isApproved ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400 flex-shrink-0" />
              )}
              <h1 className="text-4xl sm:text-5xl font-black text-white font-['Cinzel',serif] tracking-tight">
                {prediction}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              {isApproved
                ? `Approval likelihood of ${animatedProb.toFixed(1)}% satisfies the ${ (threshold * 100).toFixed(0) }% calibrated threshold under the CatBoost credit underwriting model.`
                : `Approval likelihood of ${animatedProb.toFixed(1)}% falls below the ${(threshold * 100).toFixed(0)}% decision boundary under the evaluated financial risk profile.`}
            </p>

            {/* Disclaimer */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-950/60 text-xs text-zinc-400 font-mono flex items-start space-x-2.5 max-w-xl">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>MODEL PREDICTION DISCLAIMER:</strong> This is an algorithmic machine learning prediction. KnowYourLoan does not issue credit facilities, guarantee real-world bank approvals, or act as a financial lender.
              </span>
            </div>

          </div>

          {/* Probability Radial Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#121e16"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={isApproved ? '#34D399' : '#EF4444'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {animatedProb.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mt-1">
                  Approval Probability
                </span>
                <span className="text-[9px] font-mono text-emerald-400/90 mt-0.5">
                  Cutoff: 45.0%
                </span>
              </div>
            </div>

            <span className={`mt-3 text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              isApproved
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                : 'bg-red-950/70 text-red-300 border-red-500/40'
            }`}>
              {isApproved ? 'Probability >= 0.45' : 'Probability < 0.45'}
            </span>
          </div>

        </div>

      </div>

      {/* ==============================================================
          2. EXPLAIN — REAL SHAP ATTRIBUTION FACTORS
          ============================================================== */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-950/40 gap-3">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explainable AI • SHAP TreeExplainer</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Cinzel',serif]">
              Factors that Influenced this Prediction
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Evaluated mathematically using true Shapley values for this specific applicant profile.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Positive (+ Approval)</span>
            </span>
            <span className="flex items-center space-x-1 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Negative (- Rejection)</span>
            </span>
          </div>
        </div>

        {/* Positive & Negative Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* POSITIVE FACTORS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-300 font-mono flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Positive Factors (Supporting Approval)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400/80">
                {positiveFactors.length} factors
              </span>
            </div>

            {positiveFactors.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-4">No significant positive factors found.</p>
            ) : (
              <div className="space-y-3">
                {positiveFactors.map((factor, idx) => (
                  <div
                    key={factor.feature || idx}
                    className="p-3.5 rounded-xl bg-[#06100a]/80 border border-emerald-950/80 hover:border-emerald-600/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">
                        {factor.label}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{factor.shap_value.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Applicant Value: <strong>{String(factor.value)}</strong></span>
                      <span className="text-emerald-400/80">+ Increases Probability</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(12, factor.abs_shap * 60))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEGATIVE FACTORS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
              <h3 className="text-sm font-bold text-red-300 font-mono flex items-center space-x-2">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span>Negative Factors (Supporting Rejection)</span>
              </h3>
              <span className="text-xs font-mono text-red-400/80">
                {negativeFactors.length} factors
              </span>
            </div>

            {negativeFactors.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-4">No significant negative factors found.</p>
            ) : (
              <div className="space-y-3">
                {negativeFactors.map((factor, idx) => (
                  <div
                    key={factor.feature || idx}
                    className="p-3.5 rounded-xl bg-[#110606]/80 border border-red-950/80 hover:border-red-600/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">
                        {factor.label}
                      </span>
                      <span className="font-mono text-red-400 font-bold bg-red-950/70 px-2 py-0.5 rounded border border-red-500/20">
                        {factor.shap_value.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Applicant Value: <strong>{String(factor.value)}</strong></span>
                      <span className="text-red-400/80">- Lowers Probability</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(12, factor.abs_shap * 60))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ==============================================================
          3. SUBMITTED APPLICATION RECORD (35 FEATURES)
          ============================================================== */}
      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/40">
          <div>
            <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Submitted Application Record</h2>
            <p className="text-xs text-zinc-400">All 35 parameters submitted and processed by the CatBoost underwriting engine</p>
          </div>
          <FileText className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Age</span>
            <span className="text-white font-semibold">{rawApplication.age} Years</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Gender / Marital</span>
            <span className="text-white font-semibold">{rawApplication.gender} • {rawApplication.marital_status}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Education</span>
            <span className="text-white font-semibold">{rawApplication.education}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Employment</span>
            <span className="text-white font-semibold">{rawApplication.employment_type} ({rawApplication.employment_years}y)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Monthly Income</span>
            <span className="text-white font-semibold">{formatINR(rawApplication.monthly_income)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Co-applicant Inc.</span>
            <span className="text-white font-semibold">{formatINR(rawApplication.coapplicant_income)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Credit Score</span>
            <span className="text-emerald-400 font-bold">{rawApplication.credit_score}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Credit History</span>
            <span className="text-white font-semibold">{rawApplication.credit_history_years} Years</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Late Payments 12M</span>
            <span className={rawApplication.late_payments_12m > 0 ? 'text-amber-400 font-bold' : 'text-white'}>
              {rawApplication.late_payments_12m}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Previous Defaults</span>
            <span className={Number(rawApplication.previous_defaults) > 0 ? 'text-red-400 font-bold' : 'text-white'}>
              {rawApplication.previous_defaults !== undefined && rawApplication.previous_defaults !== '' ? rawApplication.previous_defaults : 0}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Card Utilization</span>
            <span className="text-white font-semibold">{((rawApplication.credit_utilization || 0) * 100).toFixed(0)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Savings Balance</span>
            <span className="text-white font-semibold">{formatINR(rawApplication.savings_balance)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Property Assets</span>
            <span className="text-white font-semibold">{formatINR(rawApplication.property_value)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Requested Loan</span>
            <span className="text-emerald-300 font-bold">{formatINR(rawApplication.loan_amount)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Tenure & Rate</span>
            <span className="text-white font-semibold">{rawApplication.loan_tenure_months}m @ {rawApplication.annual_interest_rate}%</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Calculated EMI</span>
            <span className="text-white font-semibold">{formatINR(derived_features?.new_loan_emi)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Total Mo. Debt</span>
            <span className="text-white font-semibold">{formatINR(derived_features?.total_monthly_debt)}</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">DTI Ratio</span>
            <span className="text-white font-semibold">{(derived_features?.dti_ratio * 100).toFixed(1)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">FOIR</span>
            <span className="text-emerald-400 font-bold">{(derived_features?.foir * 100).toFixed(1)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-950/40">
            <span className="text-zinc-500 block mb-1">Loan Purpose</span>
            <span className="text-white font-semibold">{rawApplication.loan_purpose}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onNewAssessment}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-emerald-400 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Perform Another Assessment</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800/80 border border-emerald-950/60 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

    </div>
  );
}
