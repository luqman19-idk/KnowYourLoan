import React from 'react';
import { Shield, Sparkles, Code2, Users, Cpu, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function About({ setActivePage }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider shadow-inner">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>KnowYourLoan Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-['Cinzel',serif] tracking-tight">
          About KnowYourLoan
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Crafted with subtle emerald luxury, mathematical rigor, and explainable artificial intelligence.
        </p>
      </div>

      {/* Mission Card */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl space-y-6 relative overflow-hidden emerald-glow-subtle">
        <div className="flex items-center space-x-4 pb-6 border-b border-emerald-950/40">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/60">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-['Cinzel',serif]">KnowYourLoan</h2>
            <p className="text-xs font-mono text-emerald-400 font-semibold">"Predict. Explain."</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>
            KnowYourLoan was built to solve the black-box dilemma in automated credit underwriting. Traditional underwriting systems issue opaque approvals or rejections with zero recourse or explanation for consumers and risk officers.
          </p>
          <p>
            By combining a calibrated CatBoost gradient-boosted decision tree ensemble trained on 150,000 realistic Indian borrower profiles with exact SHAP TreeExplainer mathematics, KnowYourLoan delivers actionable credit intelligence:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-400 font-mono text-xs pl-2">
            <li><strong>Predict:</strong> Rigorous binary classification (APPROVED / REJECTED) with a calibrated 0.45 probability threshold.</li>
            <li><strong>Explain:</strong> Instant breakdown of the exact positive and negative drivers influencing every individual decision.</li>
          </ul>
        </div>
      </div>

      {/* Engineering Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Cinzel',serif]">Trained CatBoost Core</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Directly utilizes the trained <code>know_your_loan_catboost_model.cbm</code> model with 35 continuous and categorical features. No hard-coded logic or surrogate approximations.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Cinzel',serif]">Axiomatic SHAP XAI</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Leverages TreeExplainer to produce exact Shapley values, partitioning features into positive approval contributors and negative risk deterrents.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Cinzel',serif]">Calibrated Decisioning</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enforces the precise 0.45 probability threshold across 35 features. Fully eliminates arbitrary manual discretion in favor of objective, auditable machine-learning decisions.
          </p>
        </div>
      </div>

      {/* Quick Launch CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => { setActivePage('assessment'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-400 transition-all cursor-pointer active:scale-95"
        >
          <span>Begin Your Assessment Now</span>
        </button>
      </div>

    </div>
  );
}
