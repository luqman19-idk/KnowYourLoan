import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  BarChart3, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Layers, 
  TrendingUp,
  FileSearch,
  Scale,
  Activity
} from 'lucide-react';
import { GLOBAL_SHAP_IMPORTANCE } from '../ml/explainability';

export default function Home({ setActivePage }) {
  return (
    <div className="relative pt-24 pb-16 overflow-hidden">
      
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-wider uppercase mb-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Credit Underwriting & Explainability</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-['Cinzel',serif] leading-tight">
            KnowYourLoan
          </h1>

          <p className="text-xl sm:text-2xl font-semibold tracking-wide text-emerald-400 font-mono">
            "Predict. Explain."
          </p>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Experience next-generation loan underwriting powered by a calibrated CatBoost gradient-boosted ensemble. 
            Evaluate risk against an exact 0.45 decision threshold and unpack true SHAP feature attributions with complete transparency.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setActivePage('assessment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            <button
              onClick={() => {
                setActivePage('how-it-works');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800/80 border border-emerald-900/40 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer"
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* Core Feature Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>CatBoost 35 Features</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>True TreeExplainer SHAP</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Calibrated 0.45 Threshold</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-16 relative">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden max-w-4xl mx-auto border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-emerald-950/40 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-mono text-zinc-400 ml-2">know_your_loan_catboost_model.cbm [ONLINE]</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Decision Threshold: 0.45 (Calibrated)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              
              {/* Pillar 1: Predict */}
              <div className="bg-[#070d0a]/80 p-5 rounded-2xl border border-emerald-950/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Cinzel',serif]">1. Predict</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Evaluates 35 exact features across personal, income, debt, and credit bureau dimensions to compute strict APPROVED or REJECTED decisions.
                </p>
              </div>

              {/* Pillar 2: Explain */}
              <div className="bg-[#070d0a]/80 p-5 rounded-2xl border border-emerald-950/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Cinzel',serif]">2. Explain</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mathematical feature attributions via TreeExplainer SHAP. Separates positive drivers supporting approval from negative risk factors.
                </p>
              </div>

              {/* Pillar 3: Calibrated Decision */}
              <div className="bg-[#070d0a]/80 p-5 rounded-2xl border border-emerald-950/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Cinzel',serif]">3. Calibrated Rule</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Strict 0.45 decision boundary. Applications exceeding the threshold are approved; those falling below receive transparent risk insights.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 4 Steps Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-emerald-950/40">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel',serif]">
            Auditable Underwriting Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            A transparent 4-stage journey from application intake to explainable credit outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">STAGE 01</span>
            <h3 className="text-base font-bold text-white">Application Intake</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Applicant inputs demographic, income, debt obligations, assets, and loan parameters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-amber-950/60 space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold">STAGE 02</span>
            <h3 className="text-base font-bold text-white">Under Review</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatic derivation of EMI, Total Debt, DTI, and FOIR, followed by security validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">STAGE 03</span>
            <h3 className="text-base font-bold text-white">CatBoost Inference</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Probability evaluated against the strict 0.45 threshold: APPROVED or REJECTED.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-emerald-950/60 space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">STAGE 04</span>
            <h3 className="text-base font-bold text-white">SHAP Explainability</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unpack SHAP positive and negative drivers with complete mathematical transparency.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
