import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Clock,
  LineChart,
  FileText,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { adminLogout } from './api';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', icon: FileSpreadsheet },
  { id: 'review-queue', label: 'Review Queue', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audit-log', label: 'Audit Log', icon: ShieldAlert },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  activeTab,
  setActiveTab,
  adminUser,
  onLogout,
  reviewQueueCount = 0,
  children
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutClick = async () => {
    try {
      await adminLogout();
    } catch (_) {}
    onLogout();
  };

  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#090B0B] text-[#E1E5E6] flex flex-col md:flex-row font-sans selection:bg-[#10B981]/30 selection:text-emerald-200">
      
      {/* ==============================================================
          1. PERSISTENT SIDEBAR (Desktop)
          ============================================================== */}
      <aside
        className={`hidden md:flex flex-col bg-[#111515] border-r border-[#2A3030] transition-all duration-200 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 sticky top-0 h-screen`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#2A3030]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#171B1B] border border-[#2A3030] flex items-center justify-center text-[#10B981] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-base font-bold text-[#E1E5E6] font-['Cinzel',serif] tracking-wide block truncate">
                  KnowYourLoan
                </span>
                <span className="text-[10px] uppercase font-mono text-[#10B981] tracking-wider block">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded text-[#929B9C] hover:text-[#E1E5E6] hover:bg-[#171B1B] transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === 'review-queue' && reviewQueueCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-[#10B981]/15 text-[#10B981] font-medium border-l-2 border-[#10B981]'
                    : 'text-[#929B9C] hover:text-[#E1E5E6] hover:bg-[#171B1B]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#10B981]' : 'text-[#929B9C] group-hover:text-[#C0C7C9]'}`} />
                {!collapsed && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
                {!collapsed && showBadge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {reviewQueueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-[#2A3030] space-y-2">
          {/* Admin User info */}
          <div className="bg-[#171B1B] rounded-lg p-2.5 flex items-center justify-between border border-[#2A3030]">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-[#2A3030] flex items-center justify-center text-xs font-mono font-bold text-[#10B981] shrink-0">
                {adminUser?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              {!collapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-medium text-[#E1E5E6] truncate">{adminUser?.username || 'admin'}</div>
                  <div className="text-[10px] text-[#929B9C] truncate">{adminUser?.role || 'Administrator'}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogoutClick}
                className="p-1 rounded text-[#929B9C] hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==============================================================
          2. MOBILE NAVIGATION HEADER
          ============================================================== */}
      <div className="md:hidden bg-[#111515] border-b border-[#2A3030] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-5 h-5 text-[#10B981]" />
          <span className="text-base font-bold text-[#E1E5E6] font-['Cinzel',serif]">KnowYourLoan Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#171B1B] border border-[#2A3030] text-[#C0C7C9]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111515] border-b border-[#2A3030] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#10B981]/15 text-[#10B981] font-medium'
                    : 'text-[#929B9C] hover:text-[#E1E5E6]'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#2A3030] flex items-center justify-end">
            <button
              onClick={handleLogoutClick}
              className="text-xs text-red-400 py-2 flex items-center cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          3. MAIN CONTENT WORKSPACE & COMPACT TOP TOOLBAR
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact Top Toolbar */}
        <header className="h-16 px-6 bg-[#111515] border-b border-[#2A3030] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-[#E1E5E6] tracking-tight">
              {activeItem.label}
            </h1>
            <span className="text-[#2A3030]">/</span>
            <span className="text-xs text-[#929B9C] font-mono">
              Underwriting Operations
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-[#929B9C] bg-[#171B1B] border border-[#2A3030] px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Model Threshold: 0.45</span>
            </div>
            <div className="text-xs text-[#C0C7C9] font-mono">
              Admin: <span className="text-[#10B981] font-semibold">{adminUser?.username || 'admin'}</span>
            </div>
          </div>
        </header>

        {/* Workspace Children */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
}
