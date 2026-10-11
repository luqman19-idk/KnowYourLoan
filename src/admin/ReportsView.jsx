import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { exportApplicationsCsv, fetchApplications } from './api';

export default function ReportsView() {
  const [modelPrediction, setModelPrediction] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const blob = await exportApplicationsCsv({
        modelPrediction: modelPrediction || undefined,
        reviewStatus: reviewStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minAmount: minAmount !== '' ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== '' ? Number(maxAmount) : undefined,
      });

      // Trigger native browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowyourloan_underwriting_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMsg('CSV Export generated successfully from database records.');
    } catch (err) {
      setError(err.message || 'Export generation failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setModelPrediction('');
    setReviewStatus('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div className="pb-2 border-b border-[#252C2C]">
        <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
          Underwriting Reports & Data Export
        </h2>
        <p className="text-xs text-[#929B9C] mt-0.5">
          Generate structured CSV exports of real application records filtered by custom parameters.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Export Configuration Card */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#E1E5E6] uppercase tracking-wider font-mono">
            Filter Export Criteria
          </h3>
          <p className="text-xs text-[#929B9C] mt-1">
            Leave filters empty to export all stored underwriting applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Model Prediction
            </label>
            <select
              value={modelPrediction}
              onChange={(e) => setModelPrediction(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="">All Predictions (Approved & Rejected)</option>
              <option value="APPROVED">APPROVED Only (Probability ≥ 0.45)</option>
              <option value="REJECTED">REJECTED Only (Probability &lt; 0.45)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Administrative Review Status
            </label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="">All Review States</option>
              <option value="PENDING REVIEW">PENDING REVIEW</option>
              <option value="REVIEWED">REVIEWED</option>
            </select>
          </div>

          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Date From (UTC)
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Date To (UTC)
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Minimum Loan Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-[#929B9C] uppercase text-[10px] mb-1">
              Maximum Loan Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#252C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0E1111] border border-[#252C2C] text-xs font-mono text-[#929B9C] hover:text-[#E1E5E6] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Criteria</span>
          </button>

          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadCsv}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090B0B] font-semibold text-xs font-mono flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating CSV...' : 'Download Application CSV'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
