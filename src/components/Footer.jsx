import React from 'react';
import { Shield, Lock, Terminal, Cpu } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="border-t border-emerald-950/40 bg-[#040605] text-zinc-500 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white font-['Cinzel',serif]">KnowYourLoan</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
              Predict. Explain. Intelligent AI loan underwriting platform with CatBoost ML inference and mathematical feature attribution.
            </p>
            <div className="flex items-center space-x-3 text-xs font-mono text-emerald-400/80 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                <Cpu className="w-3 h-3 mr-1 text-emerald-400" /> CatBoost ML Inference
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                <Lock className="w-3 h-3 mr-1 text-emerald-400" /> Secure Underwriting Escrow
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-300 font-mono mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('assessment'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Loan Assessment
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('how-it-works'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Architecture & SHAP
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Team Slytherin
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-300 font-mono mb-4">
              Governance & Safety
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>CatBoost Tree Ensemble</li>
              <li>Calibrated 0.45 Threshold</li>
              <li>Axiomatic Explainability</li>
              <li>Review Safety Escrow</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-950/30 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} KnowYourLoan. Built by Team Slytherin.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-2">
            <span>Model: CatBoost 35 Features</span>
            <span className="text-emerald-500">•</span>
            <span>Threshold: 0.45</span>
            <span className="text-emerald-500">•</span>
            <span>SHAP TreeExplainer</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
