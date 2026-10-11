import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { fetchApplications, exportApplicationsCsv } from './api';

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function ApplicationsManagement({ onOpenApplication, defaultReviewStatus = null }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [modelPrediction, setModelPrediction] = useState('');
  const [reviewStatus, setReviewStatus] = useState(defaultReviewStatus || '');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [minProb, setMinProb] = useState('');
  const [maxProb, setMaxProb] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApplications({
        page,
        pageSize,
        search: search.trim() || undefined,
        modelPrediction: modelPrediction || undefined,
        reviewStatus: reviewStatus || undefined,
        minAmount: minAmount !== '' ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== '' ? Number(maxAmount) : undefined,
        minProb: minProb !== '' ? Number(minProb) / 100 : undefined,
        maxProb: maxProb !== '' ? Number(maxProb) / 100 : undefined,
        sortBy,
        sortOrder,
      });

      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [page, pageSize, modelPrediction, reviewStatus, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadApplications();
  };

  const handleClearFilters = () => {
    setSearch('');
    setModelPrediction('');
    setReviewStatus(defaultReviewStatus || '');
    setMinAmount('');
    setMaxAmount('');
    setMinProb('');
    setMaxProb('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-5">
      
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#252C2C]">
        <div>
          <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
            {defaultReviewStatus === 'PENDING REVIEW' ? 'Administrative Review Queue' : 'Loan Application Records'}
          </h2>
          <p className="text-xs text-[#929B9C] mt-0.5">
            {defaultReviewStatus === 'PENDING REVIEW'
              ? 'Applications awaiting underwriting evaluation and sign-off.'
              : 'Complete repository of real submitted underwriting applications.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#929B9C]">
          <span>Total Records: <strong className="text-emerald-400">{total}</strong></span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929B9C]" />
            <input
              type="text"
              placeholder="Search by Application ID or attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E1111] border border-[#252C2C] text-xs text-[#E1E5E6] placeholder-[#929B9C]/60 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090B0B] font-semibold text-xs transition-colors cursor-pointer"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 rounded-lg bg-[#0E1111] hover:bg-[#141818] border border-[#252C2C] text-xs text-[#929B9C] hover:text-[#E1E5E6] flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </form>

        {/* Secondary Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs font-mono">
          {/* Model Prediction */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Model Prediction</label>
            <select
              value={modelPrediction}
              onChange={(e) => { setModelPrediction(e.target.value); setPage(1); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="">All Predictions</option>
              <option value="APPROVED">APPROVED (≥ 0.45)</option>
              <option value="REJECTED">REJECTED (&lt; 0.45)</option>
            </select>
          </div>

          {/* Review Status */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Review Status</label>
            <select
              value={reviewStatus}
              onChange={(e) => { setReviewStatus(e.target.value); setPage(1); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] focus:outline-none focus:border-emerald-500/60"
            >
              <option value="">All Review States</option>
              <option value="PENDING REVIEW">PENDING REVIEW</option>
              <option value="REVIEWED">REVIEWED</option>
            </select>
          </div>

          {/* Min Loan Amount */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Min Loan (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              onBlur={() => { setPage(1); loadApplications(); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Max Loan Amount */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Max Loan (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              onBlur={() => { setPage(1); loadApplications(); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Min Probability */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Min Prob (%)</label>
            <input
              type="number"
              placeholder="0"
              value={minProb}
              onChange={(e) => setMinProb(e.target.value)}
              onBlur={() => { setPage(1); loadApplications(); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Max Probability */}
          <div>
            <label className="block text-[10px] uppercase text-[#929B9C] mb-1">Max Prob (%)</label>
            <input
              type="number"
              placeholder="100"
              value={maxProb}
              onChange={(e) => setMaxProb(e.target.value)}
              onBlur={() => { setPage(1); loadApplications(); }}
              className="w-full p-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-[#E1E5E6] placeholder-[#929B9C]/40 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#929B9C] font-mono">
            Loading application records from SQLite...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center p-6 space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-[#929B9C] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[#C0C7C9]">No matching applications found</p>
            <p className="text-xs text-[#929B9C] max-w-sm mx-auto">
              Try adjusting your search criteria, clearing active filters, or submitting an assessment via the portal.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-3 px-3 py-1.5 rounded bg-[#0E1111] border border-[#252C2C] text-xs text-emerald-400 hover:text-emerald-300 font-mono"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252C2C] text-[#929B9C] uppercase bg-[#0E1111]/80 select-none">
                  <th
                    onClick={() => toggleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:text-[#E1E5E6]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Application ID</span>
                      <ArrowUpDown className="w-3 h-3 text-[#929B9C]" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('created_at')}
                    className="py-3 px-4 cursor-pointer hover:text-[#E1E5E6]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Submitted (UTC)</span>
                      <ArrowUpDown className="w-3 h-3 text-[#929B9C]" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('loan_amount')}
                    className="py-3 px-4 cursor-pointer hover:text-[#E1E5E6]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Requested Loan</span>
                      <ArrowUpDown className="w-3 h-3 text-[#929B9C]" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('credit_score')}
                    className="py-3 px-4 cursor-pointer hover:text-[#E1E5E6]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>CIBIL</span>
                      <ArrowUpDown className="w-3 h-3 text-[#929B9C]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Defaults</th>
                  <th
                    onClick={() => toggleSort('approval_probability')}
                    className="py-3 px-4 cursor-pointer hover:text-[#E1E5E6]"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Prob</span>
                      <ArrowUpDown className="w-3 h-3 text-[#929B9C]" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Model Prediction</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4">Override</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252C2C]">
                {items.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onOpenApplication(row.id)}
                    className="hover:bg-[#0E1111] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#E1E5E6] group-hover:text-emerald-400">
                      {row.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#929B9C]">
                      {row.created_at ? row.created_at.slice(0, 16).replace('T', ' ') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[#E1E5E6] font-semibold">
                      {formatINR(row.loan_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#C0C7C9]">
                      {row.credit_score}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        Number(row.applicant_data?.previous_defaults) > 0
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'text-[#C0C7C9]'
                      }`}>
                        {row.applicant_data?.previous_defaults !== undefined && row.applicant_data?.previous_defaults !== null
                          ? row.applicant_data.previous_defaults
                          : 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#E1E5E6]">
                      {(row.approval_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.model_prediction === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {row.model_prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.review_status === 'REVIEWED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {row.review_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#929B9C]">
                      {row.manual_override_status ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {row.manual_override_status}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenApplication(row.id);
                        }}
                        className="p-1 rounded text-[#929B9C] hover:text-emerald-400 transition-colors"
                        title="View Full Application Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0E1111]/80 border-t border-[#252C2C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#929B9C]">
          <div>
            Showing <strong className="text-[#E1E5E6]">{items.length}</strong> of{' '}
            <strong className="text-[#E1E5E6]">{total}</strong> records (Page {page} of {totalPages})
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#141818] border border-[#252C2C] text-[#E1E5E6] hover:bg-[#252C2C] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#141818] border border-[#252C2C] text-[#E1E5E6] hover:bg-[#252C2C] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
