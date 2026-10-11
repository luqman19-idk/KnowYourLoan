import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Layers,
  Info,
  Calendar,
  AlertCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { fetchAnalyticsData } from './api';

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function AnalyticsDashboard({ onOpenApplication }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active chart filters
  const [selectedScatterMetric, setSelectedScatterMetric] = useState('loan_amount'); // loan_amount | credit_score | foir | dti
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [filterPrediction, setFilterPrediction] = useState('ALL'); // ALL | APPROVED | REJECTED

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalyticsData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-[#929B9C]">
        Aggregating portfolio analytics and global SHAP distributions from SQLite...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
        {error || 'Unable to load analytics data.'}
      </div>
    );
  }

  const rawPoints = data.data_points || [];
  const filteredPoints = rawPoints.filter((pt) => {
    if (filterPrediction === 'ALL') return true;
    return pt.prediction === filterPrediction;
  });

  const shapSummary = data.shap_summary || {};
  const probHisto = data.probability_histogram || [];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#252C2C]">
        <div>
          <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
            Advanced Interactive Analytics
          </h2>
          <p className="text-xs text-[#929B9C] mt-0.5">
            Real portfolio distribution, decision boundary metrics, and aggregated TreeExplainer SHAP attributions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-[#929B9C]">Analyzed Submissions:</span>
          <span className="font-bold text-emerald-400">{data.total_records}</span>
        </div>
      </div>

      {data.total_records === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#252C2C] rounded-xl p-8 space-y-3">
          <Layers className="w-10 h-10 text-[#929B9C] mx-auto opacity-40" />
          <h3 className="text-sm font-semibold text-[#C0C7C9]">No application data recorded yet</h3>
          <p className="text-xs text-[#929B9C] max-w-md mx-auto">
            Analytics are generated exclusively from genuine applicant submissions recorded in the SQLite database.
            Submit loan assessments through the portal to populate interactive charts.
          </p>
        </div>
      ) : (
        <>
          {/* SECTION A & B: PROBABILITY DISTRIBUTION & DECISION BOUNDARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Probability Histogram Card */}
            <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#E1E5E6] uppercase tracking-wider">
                    Prediction Probability Distribution
                  </h3>
                  <p className="text-xs text-[#929B9C]">
                    Binned approval likelihood with 0.45 decision threshold marker
                  </p>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Threshold: 45%
                </div>
              </div>

              {/* Visual Histogram */}
              <div className="space-y-2 pt-2">
                {probHisto.map((bin, idx) => {
                  const maxCount = Math.max(...probHisto.map((b) => b.count), 1);
                  const pctWidth = (bin.count / maxCount) * 100;
                  // bins index 0-3 are < 0.40 (Rejected), index 4 is 40-50% (Boundary), index 5+ are Approved
                  const isBoundary = idx === 4;
                  const isApprovedSide = idx >= 5;

                  return (
                    <div key={idx} className="flex items-center text-xs font-mono group">
                      <div className="w-16 text-[#929B9C] text-[11px] shrink-0">{bin.range}</div>
                      <div className="flex-1 bg-[#0E1111] h-6 rounded overflow-hidden flex items-center border border-[#252C2C] relative">
                        {/* Threshold vertical line indicator across the 40-50% band */}
                        {isBoundary && (
                          <div
                            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-400 z-10"
                            title="Decision Threshold: 0.45"
                          />
                        )}
                        <div
                          style={{ width: `${pctWidth}%` }}
                          className={`h-full flex items-center px-2 transition-all duration-300 ${
                            isApprovedSide
                              ? 'bg-emerald-500/75 group-hover:bg-emerald-400'
                              : isBoundary
                              ? 'bg-amber-500/70 group-hover:bg-amber-400'
                              : 'bg-red-500/75 group-hover:bg-red-400'
                          }`}
                        >
                          {bin.count > 0 && (
                            <span className="text-[10px] text-white font-bold">{bin.count}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 text-right text-[#929B9C] text-[11px] shrink-0 ml-2">
                        {bin.count} apps
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-[#0E1111] border border-[#252C2C] text-[11px] font-mono text-[#929B9C] flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> &lt;45%: Auto-Reject
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" /> 45%: Boundary
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> ≥45%: Auto-Approve
                </span>
              </div>
            </div>

            {/* Interactive Scatterplot / Portfolio Explorer */}
            <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#E1E5E6] uppercase tracking-wider">
                    Interactive Portfolio Explorer
                  </h3>
                  <p className="text-xs text-[#929B9C]">
                    X-Axis: Approval Probability vs. Selected Metric
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedScatterMetric}
                    onChange={(e) => setSelectedScatterMetric(e.target.value)}
                    className="p-1 rounded bg-[#0E1111] border border-[#252C2C] text-xs font-mono text-[#E1E5E6]"
                  >
                    <option value="loan_amount">Loan Amount (₹)</option>
                    <option value="credit_score">CIBIL Score</option>
                    <option value="foir">FOIR Ratio</option>
                    <option value="dti">DTI Ratio</option>
                  </select>
                </div>
              </div>

              {/* Scatter Canvas Grid */}
              <div className="relative h-64 bg-[#0E1111] border border-[#252C2C] rounded-lg p-4 overflow-hidden select-none">
                {/* 0.45 Threshold Vertical Gridline */}
                <div
                  style={{ left: '45%' }}
                  className="absolute top-0 bottom-0 w-[1px] bg-dashed border-r border-dashed border-emerald-500/40 z-0"
                >
                  <span className="absolute top-1 left-1 text-[9px] font-mono text-emerald-400 bg-[#0E1111]/90 px-1 rounded">
                    0.45
                  </span>
                </div>

                {/* Plot Data Points */}
                {filteredPoints.map((pt, idx) => {
                  const xPct = Math.min(100, Math.max(0, pt.prob * 100));
                  let yPct = 50;

                  if (selectedScatterMetric === 'loan_amount') {
                    // map ₹0 - ₹5,000,000 to 0 - 100%
                    yPct = Math.min(100, Math.max(5, (pt.loan_amount / 5000000) * 100));
                  } else if (selectedScatterMetric === 'credit_score') {
                    // map 300 - 900 to 0 - 100%
                    yPct = Math.min(100, Math.max(5, ((pt.credit_score - 300) / 600) * 100));
                  } else if (selectedScatterMetric === 'foir') {
                    // map 0 - 1.5 to 0 - 100%
                    yPct = Math.min(100, Math.max(5, (pt.foir / 1.5) * 100));
                  } else if (selectedScatterMetric === 'dti') {
                    yPct = Math.min(100, Math.max(5, (pt.dti / 1.5) * 100));
                  }

                  const isPtApproved = pt.prediction === 'APPROVED';

                  return (
                    <button
                      key={idx}
                      style={{ left: `${xPct}%`, bottom: `${yPct}%` }}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => onOpenApplication(pt.id)}
                      className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-150 z-10 ${
                        isPtApproved
                          ? 'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'bg-red-400 border border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      }`}
                      title={`${pt.id}: ${(pt.prob * 100).toFixed(1)}%`}
                    />
                  );
                })}

                {/* Hover Tooltip Overlay */}
                {hoveredPoint && (
                  <div className="absolute top-2 right-2 bg-[#141818]/95 border border-[#252C2C] p-2.5 rounded-lg text-xs font-mono shadow-xl z-20 space-y-1">
                    <div className="font-bold text-[#E1E5E6] flex items-center justify-between gap-3">
                      <span>{hoveredPoint.id}</span>
                      <span className={hoveredPoint.prediction === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}>
                        {hoveredPoint.prediction}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#929B9C]">
                      Prob: <strong className="text-[#E1E5E6]">{(hoveredPoint.prob * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="text-[11px] text-[#929B9C]">
                      Loan: <strong className="text-[#E1E5E6]">{formatINR(hoveredPoint.loan_amount)}</strong>
                    </div>
                    <div className="text-[11px] text-[#929B9C]">
                      CIBIL: <strong className="text-[#E1E5E6]">{hoveredPoint.credit_score}</strong> | FOIR: <strong className="text-[#E1E5E6]">{(hoveredPoint.foir * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="text-[10px] text-emerald-400 underline pt-0.5">
                      Click point to inspect
                    </div>
                  </div>
                )}
              </div>

              {/* Legend & Filter Controls */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3 text-[#929B9C]">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" /> Approved
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5" /> Rejected
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[#929B9C] mr-1">Filter:</span>
                  {['ALL', 'APPROVED', 'REJECTED'].map((pred) => (
                    <button
                      key={pred}
                      onClick={() => setFilterPrediction(pred)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                        filterPrediction === pred
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                          : 'bg-[#0E1111] text-[#929B9C] border border-[#252C2C]'
                      }`}
                    >
                      {pred}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* SECTION C: GLOBAL SHAP FEATURE IMPORTANCE */}
          <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252C2C] pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-[#E1E5E6] uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Aggregated Portfolio SHAP Feature Attributions</span>
                </h3>
                <p className="text-xs text-[#929B9C] mt-0.5">
                  Empirical feature contribution patterns computed across all stored applications in the SQLite database.
                </p>
              </div>

              <div className="text-xs font-mono text-[#929B9C]">
                Sample Size: <strong className="text-emerald-400">{shapSummary.records_analyzed ?? 0}</strong> records
              </div>
            </div>

            {/* Top Frequency Drivers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Positive Contributors */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Most Frequent Positive Contributors</span>
                </div>

                {(!shapSummary.top_positive_contributors || shapSummary.top_positive_contributors.length === 0) ? (
                  <p className="text-xs text-[#929B9C] italic">No positive attributions found.</p>
                ) : (
                  <div className="space-y-2">
                    {shapSummary.top_positive_contributors.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#0E1111] border border-emerald-500/20 text-xs font-mono flex items-center justify-between">
                        <span className="text-[#E1E5E6] font-medium">{f.feature}</span>
                        <span className="text-emerald-400 font-bold">{f.count} applications</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Negative Contributors */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-red-400 font-bold uppercase flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>Most Frequent Risk Penalties (-SHAP)</span>
                </div>

                {(!shapSummary.top_negative_contributors || shapSummary.top_negative_contributors.length === 0) ? (
                  <p className="text-xs text-[#929B9C] italic">No negative penalties recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {shapSummary.top_negative_contributors.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#0E1111] border border-red-500/20 text-xs font-mono flex items-center justify-between">
                        <span className="text-[#E1E5E6] font-medium">{f.feature}</span>
                        <span className="text-red-400 font-bold">{f.count} applications</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Average Absolute Impact Bar chart */}
            {shapSummary.average_feature_importance && shapSummary.average_feature_importance.length > 0 && (
              <div className="pt-4 border-t border-[#252C2C] space-y-3">
                <div className="text-xs font-mono text-[#C0C7C9] uppercase font-semibold">
                  Mean Absolute Impact on Decision (|SHAP|)
                </div>

                <div className="space-y-2">
                  {shapSummary.average_feature_importance.slice(0, 6).map((imp, idx) => {
                    const maxImp = Math.max(...shapSummary.average_feature_importance.map((x) => x.avg_abs_shap), 0.1);
                    const pct = (imp.avg_abs_shap / maxImp) * 100;

                    return (
                      <div key={idx} className="flex items-center text-xs font-mono">
                        <div className="w-48 text-[#929B9C] truncate text-[11px] shrink-0">{imp.feature}</div>
                        <div className="flex-1 bg-[#0E1111] h-4 rounded overflow-hidden flex items-center border border-[#252C2C]">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-emerald-500/70 h-full rounded"
                          />
                        </div>
                        <div className="w-16 text-right text-emerald-400 font-bold text-[11px] shrink-0 ml-2">
                          {imp.avg_abs_shap}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
