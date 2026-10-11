import React from 'react';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Lock, 
  Code2, 
  CheckCircle2, 
  Sparkles,
  BarChart2,
  GitBranch,
  ShieldCheck,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { GLOBAL_SHAP_IMPORTANCE } from '../ml/explainability';

export default function HowItWorks({ setActivePage }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider shadow-inner">
          <Workflow className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Architecture & XAI Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-['Cinzel',serif] tracking-tight">
          How KnowYourLoan Works
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Transparent, deterministic, machine-learning-driven underwriting. Here is the exact mathematical pipeline from raw parameters to probability attribution and calibrated decisioning.
        </p>
      </div>

      {/* 4-Step Pipeline Flow */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>The End-to-End Execution Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 01</span>
            <h3 className="text-base font-bold text-white font-['Cinzel',serif]">1. Raw Applicant Inputs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Accepts 31 base parameters across personal demographics, employment, monthly income, current debts, credit bureau ratings, and loan requests.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 02</span>
            <h3 className="text-base font-bold text-white font-['Cinzel',serif]">2. Derived Features</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically calculates Amortized EMI, Total Monthly Debt, DTI Ratio, and FOIR using standard financial equations to form 35 features.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 03</span>
            <h3 className="text-base font-bold text-white font-['Cinzel',serif]">3. CatBoost Inference</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              CatBoostClassifier processes native categorical and numeric features. Compares calculated probability to the 0.45 decision threshold.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 04</span>
            <h3 className="text-base font-bold text-white font-['Cinzel',serif]">4. SHAP Attributions</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              TreeExplainer decomposes model output into Shapley values, partitioning features into positive approval drivers and negative risk factors.
            </p>
          </div>

        </div>
      </div>

      {/* Derived Financial Equations */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-emerald-500/20">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/40">
          <div>
            <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Automated Financial Engineering</h2>
            <p className="text-xs text-zinc-400">Formulas used to derive debt burden and repayment capability</p>
          </div>
          <Calculator className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block">1. Amortized Loan EMI (PMT Formula)</span>
            <p className="text-zinc-300">
              r = annual_interest_rate / 12 / 100<br />
              EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)
            </p>
            <p className="text-zinc-500 text-[11px]">Where P is loan amount, r is monthly rate, and n is tenure in months.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block">2. Total Monthly Debt</span>
            <p className="text-zinc-300">
              total_monthly_debt = existing_emi + new_loan_emi
            </p>
            <p className="text-zinc-500 text-[11px]">Combines ongoing monthly payments with the prospective loan liability.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block">3. Debt-to-Income (DTI) Ratio</span>
            <p className="text-zinc-300">
              dti_ratio = total_monthly_debt / total_monthly_income
            </p>
            <p className="text-zinc-500 text-[11px]">Total monthly debt divided by aggregate household earnings.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block">4. Fixed Obligation to Income (FOIR)</span>
            <p className="text-zinc-300">
              foir = total_monthly_debt / (total_monthly_income - 0.5 × monthly_expenses)
            </p>
            <p className="text-zinc-500 text-[11px]">Primary underwriting measure of disposable income debt absorption capacity.</p>
          </div>
        </div>
      </div>

      {/* Global SHAP Feature Importance Table */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/40">
          <div>
            <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Global Feature Importance (SHAP Ranking)</h2>
            <p className="text-xs text-zinc-400">Mean absolute Shapley values from the trained CatBoost production model</p>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="space-y-3">
          {GLOBAL_SHAP_IMPORTANCE.map((item) => (
            <div key={item.feature} className="p-3.5 rounded-xl bg-zinc-900/40 border border-emerald-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-md bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                  #{item.rank}
                </span>
                <span className="text-zinc-200 font-semibold">{item.readable}</span>
                <span className="text-zinc-500 text-[11px]">({item.feature})</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, item.meanAbsSHAP * 70)}%` }} />
                </div>
                <span className="text-emerald-400 font-bold w-12 text-right">
                  {item.meanAbsSHAP.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            if (setActivePage) setActivePage('assessment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-400 transition-all cursor-pointer"
        >
          <span>Try an Assessment</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

    </div>
  );
}
