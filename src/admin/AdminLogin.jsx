import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { adminLogin } from './api';

export default function AdminLogin({ onLoginSuccess, onBackToLanding }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminLogin(username.trim(), password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#090B0B] text-[#E1E5E6] font-sans selection:bg-[#10B981]/30 selection:text-emerald-200">
      <div className="w-full max-w-md">
        <div className="bg-[#171B1B] border border-[#2A3030] rounded-xl p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[#E1E5E6] font-['Cinzel',serif]">
              KnowYourLoan
            </h1>
            <div className="text-xs font-mono uppercase tracking-widest text-[#10B981]">
              Administrator Sign In
            </div>
            <p className="text-xs text-[#929B9C] pt-1">
              Protected console. Authorised administrative access only.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#929B9C] mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#929B9C]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#111515] border border-[#2A3030] text-sm text-[#E1E5E6] placeholder-[#929B9C]/50 focus:outline-none focus:border-[#10B981] transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#929B9C]">
                  Password
                </label>
                <span className="text-[10px] text-[#929B9C] font-mono">Default: Admin@KYL2026</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#929B9C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#111515] border border-[#2A3030] text-sm text-[#E1E5E6] placeholder-[#929B9C]/50 focus:outline-none focus:border-[#10B981] transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-[#10B981] hover:bg-[#0da271] text-[#090B0B] font-bold text-sm tracking-wide transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {onBackToLanding && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-xs text-[#929B9C] hover:text-[#E1E5E6] transition-colors cursor-pointer"
              >
                ← Return to Admin Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
