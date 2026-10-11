import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  Sliders,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function AdminSettingsView({ adminUser }) {
  const [pageSizePref, setPageSizePref] = useState(
    () => localStorage.getItem('kyl_pref_page_size') || '15'
  );
  const [defaultDateRangePref, setDefaultDateRangePref] = useState(
    () => localStorage.getItem('kyl_pref_date_range') || 'all'
  );
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('kyl_pref_page_size', pageSizePref);
    localStorage.setItem('kyl_pref_date_range', defaultDateRangePref);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div className="pb-2 border-b border-[#252C2C]">
        <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
          Administrative Settings & Profile
        </h2>
        <p className="text-xs text-[#929B9C] mt-0.5">
          Active administrative session details, system security posture, and local console preferences.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Console preferences saved to local profile.</span>
        </div>
      )}

      {/* Admin Profile & Session Information */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
          <Shield className="w-4 h-4" />
          <span className="uppercase">Active Admin Session</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] text-[10px] uppercase block">Username</span>
            <span className="text-sm font-bold text-[#E1E5E6]">{adminUser?.username || 'admin'}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] text-[10px] uppercase block">Assigned Role</span>
            <span className="text-sm font-bold text-emerald-400">{adminUser?.role || 'Super Administrator'}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] text-[10px] uppercase block">Authentication Standard</span>
            <span className="text-sm font-bold text-[#C0C7C9]">PBKDF2 HMAC SHA-256 (260,000 Rounds)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C]">
            <span className="text-[#929B9C] text-[10px] uppercase block">Session Token Life</span>
            <span className="text-sm font-bold text-[#C0C7C9]">24 Hours Rotating Escrow</span>
          </div>
        </div>
      </div>

      {/* Underwriting Model Configuration (Read-only Governance) */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
          <Sliders className="w-4 h-4" />
          <span className="uppercase">Machine Learning Model Constraints</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0E1111] border border-[#252C2C] space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#929B9C]">Calibrated Decision Boundary:</span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              0.45 (Locked)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#929B9C]">Model Weights File:</span>
            <span className="text-[#E1E5E6]">know_your_loan_catboost_model.cbm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#929B9C]">Expected Feature Vector:</span>
            <span className="text-[#E1E5E6]">35 Features (Strict Schema)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#929B9C]">SHAP Engine:</span>
            <span className="text-[#E1E5E6]">shap.TreeExplainer (Exact Algorithmic Attribution)</span>
          </div>
          <p className="text-[11px] text-[#929B9C] italic pt-1 border-t border-[#252C2C]">
            Note: In strict compliance with underwriting integrity, the ML threshold remains fixed at 0.45.
          </p>
        </div>
      </div>

      {/* Console Display Preferences */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold border-b border-[#252C2C] pb-2">
          <Settings className="w-4 h-4" />
          <span className="uppercase">Console Display Preferences</span>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
                Default Page Size (Application Table)
              </label>
              <select
                value={pageSizePref}
                onChange={(e) => setPageSizePref(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="10">10 records per page</option>
                <option value="15">15 records per page (Default)</option>
                <option value="25">25 records per page</option>
                <option value="50">50 records per page</option>
              </select>
            </div>

            <div>
              <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
                Default Overview Timeframe
              </label>
              <select
                value={defaultDateRangePref}
                onChange={(e) => setDefaultDateRangePref(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
              >
                <option value="all">All Time (Default)</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090B0B] font-semibold text-xs font-mono transition-colors cursor-pointer"
            >
              Save Display Preferences
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
