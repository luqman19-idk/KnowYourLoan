import React, { useState, useEffect } from 'react';
import AdminLanding from './AdminLanding';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminOverview from './AdminOverview';
import ApplicationsManagement from './ApplicationsManagement';
import ApplicationDetail from './ApplicationDetail';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReportsView from './ReportsView';
import AuditLogView from './AuditLogView';
import AdminSettingsView from './AdminSettingsView';
import { getAdminToken, getAdminUser, clearAdminAuth, fetchAdminOverview } from './api';

export default function AdminPortal() {
  const [token, setToken] = useState(() => getAdminToken());
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login'
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [reviewQueueCount, setReviewQueueCount] = useState(0);

  // Poll review queue count periodically or on tab change
  const refreshReviewQueueCount = async () => {
    if (!token) return;
    try {
      const res = await fetchAdminOverview();
      setReviewQueueCount(res.under_review_count || 0);
    } catch (_) {}
  };

  useEffect(() => {
    if (token) {
      refreshReviewQueueCount();
    }
  }, [token, activeTab]);

  const handleLoginSuccess = (loginData) => {
    setToken(loginData.token);
    setAdminUser({
      username: loginData.username,
      role: loginData.role,
      fullName: loginData.full_name,
    });
    setActiveTab('overview');
  };

  const handleLogout = () => {
    clearAdminAuth();
    setToken(null);
    setAdminUser(null);
    setAuthView('landing');
  };

  const handleOpenApplication = (appId) => {
    setSelectedAppId(appId);
    setActiveTab('application-detail');
  };

  const handleBackToList = () => {
    setSelectedAppId(null);
    setActiveTab('applications');
    refreshReviewQueueCount();
  };

  // 1. Unauthenticated: Show Minimalist Admin Landing Page
  if (!token && authView === 'landing') {
    return (
      <AdminLanding
        onGoToLogin={() => setAuthView('login')}
      />
    );
  }

  // 2. Unauthenticated: Show Login Page
  if (!token && authView === 'login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setAuthView('landing')}
      />
    );
  }

  // 3. Authenticated: Show Full Admin Console
  return (
    <AdminLayout
      activeTab={activeTab === 'application-detail' ? 'applications' : activeTab}
      setActiveTab={(tab) => {
        setSelectedAppId(null);
        setActiveTab(tab);
      }}
      adminUser={adminUser}
      onLogout={handleLogout}
      reviewQueueCount={reviewQueueCount}
    >
      {activeTab === 'overview' && (
        <AdminOverview
          onNavigate={(tab, appId) => {
            if (appId) {
              handleOpenApplication(appId);
            } else {
              setActiveTab(tab);
            }
          }}
        />
      )}

      {activeTab === 'applications' && (
        <ApplicationsManagement
          onOpenApplication={handleOpenApplication}
        />
      )}

      {activeTab === 'review-queue' && (
        <ApplicationsManagement
          defaultReviewStatus="PENDING REVIEW"
          onOpenApplication={handleOpenApplication}
        />
      )}

      {activeTab === 'application-detail' && selectedAppId && (
        <ApplicationDetail
          appId={selectedAppId}
          onBack={handleBackToList}
          adminUser={adminUser}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard
          onOpenApplication={handleOpenApplication}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsView />
      )}

      {activeTab === 'audit-log' && (
        <AuditLogView
          onOpenApplication={handleOpenApplication}
        />
      )}

      {activeTab === 'settings' && (
        <AdminSettingsView
          adminUser={adminUser}
        />
      )}
    </AdminLayout>
  );
}
