import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { fetchAuditLogs } from './api';

export default function AuditLogView({ onOpenApplication }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs(page, 30);
      setLogs(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">LOGIN</span>;
      case 'LOGIN_FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">LOGIN_FAILED</span>;
      case 'LOGOUT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0E1111] text-[#929B9C] border border-[#252C2C]">LOGOUT</span>;
      case 'STATUS_UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">STATUS_UPDATE</span>;
      case 'MANUAL_OVERRIDE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">MANUAL_OVERRIDE</span>;
      case 'ADD_NOTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">ADD_NOTE</span>;
      case 'EXPORT_CSV':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">EXPORT_CSV</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0E1111] text-[#E1E5E6] border border-[#252C2C]">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#252C2C]">
        <div>
          <h2 className="text-xl font-bold text-[#E1E5E6] font-['Cinzel',serif]">
            Administrative Audit Log
          </h2>
          <p className="text-xs text-[#929B9C] mt-0.5">
            Cryptographically sealed, append-only history of administrative underwriting actions and logins.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-[#929B9C]">
            Total Events: <strong className="text-emerald-400">{total}</strong>
          </span>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-1.5 rounded bg-[#141818] border border-[#252C2C] text-[#929B9C] hover:text-[#E1E5E6] cursor-pointer disabled:opacity-50"
            title="Refresh logs"
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

      {/* Log Table Card */}
      <div className="bg-[#141818] border border-[#252C2C] rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#929B9C] font-mono">
            Loading immutable audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#929B9C] font-mono">
            No audit records registered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252C2C] text-[#929B9C] uppercase bg-[#0E1111]/80 select-none">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Previous Value</th>
                  <th className="py-3 px-4">New Value</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252C2C]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0E1111]/60 transition-colors">
                    <td className="py-3 px-4 text-[#929B9C]">
                      {log.timestamp ? log.timestamp.slice(0, 19).replace('T', ' ') : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#E1E5E6]">
                      {log.admin_username}
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4">
                      {log.application_id ? (
                        <button
                          onClick={() => onOpenApplication(log.application_id)}
                          className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          {log.application_id}
                        </button>
                      ) : (
                        <span className="text-[#929B9C]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#929B9C]">
                      {log.previous_value || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#E1E5E6]">
                      {log.new_value || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#C0C7C9] max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0E1111]/80 border-t border-[#252C2C] flex items-center justify-between text-xs font-mono text-[#929B9C]">
          <div>
            Showing <strong className="text-[#E1E5E6]">{logs.length}</strong> events (Page {page} of {totalPages})
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#141818] border border-[#252C2C] text-[#E1E5E6] hover:bg-[#252C2C] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#141818] border border-[#252C2C] text-[#E1E5E6] hover:bg-[#252C2C] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
