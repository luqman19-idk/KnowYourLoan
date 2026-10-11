import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu, ShieldCheck, Clock, FileCheck2, Activity, ArrowRight } from 'lucide-react';

const AUDIT_STEPS = [
  { id: 1, label: 'Verifying 35 applicant parameters & financial constraints' },
  { id: 2, label: 'Computing derived metrics (Amortized EMI, Total Debt, DTI, FOIR)' },
  { id: 3, label: 'Executing CatBoost tree ensemble inference (Decision Threshold: 0.45)' },
  { id: 4, label: 'Calculating TreeExplainer SHAP attributions for positive & negative drivers' },
];

export default function LoadingExperience({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Stepped progression across ~2.0 seconds total to give high-trust feel
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AUDIT_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 450);
          return prev;
        }
      });
    }, 480);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-24">
      <div className="glass-panel max-w-xl w-full p-8 sm:p-10 rounded-3xl relative overflow-hidden emerald-glow-subtle border border-emerald-500/20 text-center space-y-8">
        
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Workflow Progression Stepper Bar */}
        <div className="flex items-center justify-between max-w-md mx-auto text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Submitted</span>
          </div>
          <div className="h-[1px] flex-1 bg-emerald-500/40 mx-2" />
          <div className="flex items-center space-x-1.5 text-amber-300 font-bold bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Under Review</span>
          </div>
          <div className="h-[1px] flex-1 bg-zinc-800 mx-2" />
          <div className="flex items-center space-x-1.5 text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Decision</span>
          </div>
        </div>

        {/* Central Pulsing Glass Node */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-amber-500/20 border-b-amber-400 animate-[spin_2.5s_linear_infinite_reverse]" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-[#06150e] border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Main Status Callout */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Application Status: Under Review</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel',serif]">
            Auditing Underwriting Criteria
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your application record is being evaluated against the production CatBoost decision engine and calibrated threshold.
          </p>
        </div>

        {/* Step-by-Step Execution Checklist */}
        <div className="space-y-2.5 text-left pt-2">
          {AUDIT_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-950/60 border border-emerald-500/40 shadow-inner'
                    : isDone
                    ? 'bg-zinc-900/40 border border-emerald-950/40 text-zinc-300'
                    : 'text-zinc-600 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <span className={`text-xs font-mono ${isCurrent ? 'text-emerald-300 font-semibold' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <div className="pt-2 text-[11px] font-mono text-zinc-500 border-t border-emerald-950/40">
          CatBoost Native Categoricals • Real-Time SHAP Explanations • Decision Boundary: 0.45
        </div>

      </div>
    </div>
  );
}
