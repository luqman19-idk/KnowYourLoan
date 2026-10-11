import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Percent,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { fetchAdminOverview } from './api';

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function AdminOverview({ onNavigate }) {
  const [dateRange, setDateRange] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    let dateFrom = null;
    const now = new Date();
    if (dateRange === '7d') {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFrom = d.toISOString();
    } else if (dateRange === '30d') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFrom = d.toISOString();
    } else if (dateRange === '90d') {
      const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFrom = d.toISOString();
    }

    try {
      const res = await fetchAdminOverview({ dateFrom });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch overview metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const kpis = [
    {
      title: 'Total Applications',
      value: data?.total_applications ?? 0,
      sub: 'Persisted in database',
      icon: FileSpreadsheet,
      accent: 'text-[#E1E5E6]',
      bg: 'bg-[#141818]',
    },
    {
      title: 'Approved Predictions',
      value: data?.approved_predictions ?? 0,
      sub: 'Model prob ≥ 0.45',
      icon: CheckCircle2,
      accent: 'text-emerald-400',
      bg: 'bg-[#141818]',
    },
    {
      title: 'Rejected Predictions',
      value: data?.rejected_predictions ?? 0,
      sub: 'Model prob < 0.45',
      icon: XCircle,
      accent: 'text-red-400',
      bg: 'bg-[#141818]',
    },
    {
      title: 'Approval Rate',
      value: `${data?.approval_rate ?? 0}%`,
      sub: 'CatBoost automated rate',
      icon: Percent,
      accent: 'text-emerald-400',
      bg: 'bg-[#141818]',
    },
    {
      title: 'Pending Review',
      value: data?.pending_review_count ?? data?.under_review_count ?? 0,
      sub: 'Awaiting admin review',
      icon: Clock,
      accent: 'text-amber-300',
      bg: 'bg-[#141818]',
      action: () => onNavigate('review-queue'),
    },
    {
      title: 'Total Loan Requested',
      value: formatINR(data?.total_loan_requested ?? 0),
      sub: `Avg: ${formatINR(data?.avg_loan_amount ?? 0)}`,
      icon: IndianRupee,
      accent: 'text-[#C0C7C9]',
      bg: 'bg-[#141818]',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#252C2C]">
        <div>
          <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
            Operational Overview
          </h2>
          <p className="text-xs text-[#929B9C] mt-0.5">
            Key lending portfolio metrics and real application activity.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Date Range Selector */}
          <div className="flex items-center bg-[#141818] border border-[#252C2C] rounded-lg p-1 text-xs font-mono">
            {[
              { id: 'all', label: 'All Time' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  dateRange === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-[#929B9C] hover:text-[#E1E5E6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-[#141818] border border-[#252C2C] text-[#929B9C] hover:text-[#E1E5E6] hover:border-emerald-500/40 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className={`p-5 rounded-xl border border-[#252C2C] ${kpi.bg} flex flex-col justify-between transition-all duration-150 ${
                kpi.action ? 'cursor-pointer hover:border-amber-500/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#929B9C]">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[#C0C7C9]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${kpi.accent}`}>
                  {loading ? '—' : kpi.value}
                </div>
                <div className="text-[11px] text-[#929B9C] mt-1 flex items-center justify-between">
                  <span>{kpi.sub}</span>
                  {kpi.action && (
                    <span className="text-amber-400 font-medium hover:underline flex items-center">
                      Open queue <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity & Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Summary Chart Card */}
        <div className="lg:col-span-2 bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#E1E5E6] uppercase tracking-wider font-mono">
                Daily Application Submissions
              </h3>
              <p className="text-xs text-[#929B9C]">
                Submissions and binary model decisions across recorded dates
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center cursor-pointer"
            >
              Interactive Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Time Series Bar Visualization */}
          {loading ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#929B9C] font-mono">
              Loading submission trend data...
            </div>
          ) : !data?.time_series || data.time_series.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#252C2C] rounded-lg">
              <Calendar className="w-8 h-8 text-[#929B9C] mb-2" />
              <p className="text-sm text-[#C0C7C9] font-medium">No application submissions in this timeframe</p>
              <p className="text-xs text-[#929B9C] mt-1 max-w-sm">
                Applications submitted via the public portal will appear here in chronological buckets.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-4 text-xs font-mono text-[#929B9C] pb-2 border-b border-[#252C2C]">
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded bg-emerald-500 mr-1.5" /> Approved
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded bg-red-500 mr-1.5" /> Rejected
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.time_series.map((ts, idx) => {
                  const maxTotal = Math.max(...data.time_series.map((x) => x.total), 1);
                  const appPct = (ts.approved / maxTotal) * 100;
                  const rejPct = (ts.rejected / maxTotal) * 100;

                  return (
                    <div key={idx} className="flex items-center text-xs font-mono">
                      <div className="w-24 text-[#929B9C] shrink-0">{ts.date_bucket}</div>
                      <div className="flex-1 bg-[#0E1111] h-5 rounded overflow-hidden flex items-center border border-[#252C2C]">
                        {ts.approved > 0 && (
                          <div
                            style={{ width: `${appPct}%` }}
                            className="bg-emerald-500/80 h-full flex items-center justify-center text-[10px] text-white font-bold"
                            title={`Approved: ${ts.approved}`}
                          >
                            {ts.approved}
                          </div>
                        )}
                        {ts.rejected > 0 && (
                          <div
                            style={{ width: `${rejPct}%` }}
                            className="bg-red-500/80 h-full flex items-center justify-center text-[10px] text-white font-bold"
                            title={`Rejected: ${ts.rejected}`}
                          >
                            {ts.rejected}
                          </div>
                        )}
                      </div>
                      <div className="w-16 text-right text-[#C0C7C9] font-bold shrink-0">
                        {ts.total} total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Review Queue Summary Card */}
        <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E1E5E6] uppercase tracking-wider font-mono">
                Review Queue Summary
              </h3>
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-xs text-[#929B9C] mt-1">
              Applications requiring human administrative sign-off.
            </p>

            <div className="mt-6 p-4 rounded-lg bg-[#0E1111] border border-[#252C2C] text-center space-y-1">
              <div className="text-3xl font-bold font-mono text-amber-300">
                {data?.pending_review_count ?? data?.under_review_count ?? 0}
              </div>
              <div className="text-xs text-[#929B9C]">
                Applications currently in "PENDING REVIEW" state
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono text-[#929B9C]">
              <div className="flex justify-between py-1 border-b border-[#252C2C]">
                <span>Reviewed to date:</span>
                <span className="text-emerald-400 font-semibold">{data?.reviewed_count ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252C2C]">
                <span>Avg Portfolio Credit Score:</span>
                <span className="text-[#E1E5E6] font-semibold">{data?.avg_credit_score ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Avg Portfolio FOIR:</span>
                <span className="text-[#E1E5E6] font-semibold">{((data?.avg_foir ?? 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('review-queue')}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold font-mono flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Open Review Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Applications Table */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#E1E5E6] uppercase tracking-wider font-mono">
              Recent Submissions
            </h3>
            <p className="text-xs text-[#929B9C]">
              Latest applications received by the underwriting system
            </p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center cursor-pointer"
          >
            View All Applications <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#929B9C] font-mono">
            Loading recent records...
          </div>
        ) : !data?.recent_applications || data.recent_applications.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#252C2C] rounded-lg text-xs text-[#929B9C]">
            No application submissions recorded yet. Use the applicant portal to submit a loan assessment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252C2C] text-[#929B9C] uppercase">
                  <th className="py-2.5 px-3">Application ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">CIBIL</th>
                  <th className="py-2.5 px-3">Probability</th>
                  <th className="py-2.5 px-3">Model Prediction</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252C2C]">
                {data.recent_applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#0E1111]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#E1E5E6]">{app.id}</td>
                    <td className="py-3 px-3 text-[#929B9C]">{app.created_at?.slice(0, 16).replace('T', ' ')}</td>
                    <td className="py-3 px-3 text-[#E1E5E6]">{formatINR(app.loan_amount)}</td>
                    <td className="py-3 px-3 text-[#C0C7C9]">{app.credit_score}</td>
                    <td className="py-3 px-3 font-bold text-[#E1E5E6]">{(app.approval_probability * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.model_prediction === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {app.model_prediction}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.review_status === 'REVIEWED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {app.review_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('application-detail', app.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
