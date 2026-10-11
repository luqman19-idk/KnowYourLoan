/**
 * KnowYourLoan Admin API Client
 * Secure authenticated interface to /api/admin endpoints.
 */

const TOKEN_KEY = 'kyl_admin_token';
const USER_KEY = 'kyl_admin_user';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const API_BASE_CANDIDATES = [
  '', // Relative (vite proxy)
  'http://127.0.0.1:8000',
  'http://localhost:8000',
];

async function callAdminApi(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError = null;

  for (const base of API_BASE_CANDIDATES) {
    const url = `${base}${path}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        clearAdminAuth();
        throw new Error('Admin session expired or unauthorized. Please log in.');
      }

      if (!response.ok) {
        let errMessage = `Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      // Check if blob (e.g. for CSV export)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return await response.blob();
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes('Admin session expired')) {
        throw err;
      }
      continue;
    }
  }

  throw lastError || new Error(`Failed admin API communication at ${path}`);
}

export async function adminLogin(username, password) {
  const res = await callAdminApi('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAdminAuth(res.token, {
    username: res.username,
    role: res.role,
    fullName: res.full_name,
  });
  return res;
}

export async function adminLogout() {
  try {
    await callAdminApi('/api/admin/logout', { method: 'POST' });
  } finally {
    clearAdminAuth();
  }
}

export async function fetchAdminMe() {
  return await callAdminApi('/api/admin/me');
}

export async function fetchAdminOverview(params = {}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set('date_from', params.dateFrom);
  if (params.dateTo) query.set('date_to', params.dateTo);
  const qs = query.toString();
  return await callAdminApi(`/api/admin/overview${qs ? `?${qs}` : ''}`);
}

export async function fetchApplications(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.pageSize) query.set('page_size', params.pageSize);
  if (params.search) query.set('search', params.search);
  if (params.modelPrediction) query.set('model_prediction', params.modelPrediction);
  if (params.reviewStatus) query.set('review_status', params.reviewStatus);
  if (params.dateFrom) query.set('date_from', params.dateFrom);
  if (params.dateTo) query.set('date_to', params.dateTo);
  if (params.minAmount !== undefined && params.minAmount !== '') query.set('min_amount', params.minAmount);
  if (params.maxAmount !== undefined && params.maxAmount !== '') query.set('max_amount', params.maxAmount);
  if (params.minProb !== undefined && params.minProb !== '') query.set('min_prob', params.minProb);
  if (params.maxProb !== undefined && params.maxProb !== '') query.set('max_prob', params.maxProb);
  if (params.sortBy) query.set('sort_by', params.sortBy);
  if (params.sortOrder) query.set('sort_order', params.sortOrder);
  const qs = query.toString();
  return await callAdminApi(`/api/admin/applications${qs ? `?${qs}` : ''}`);
}

export async function fetchApplicationDetail(appId) {
  return await callAdminApi(`/api/admin/applications/${appId}`);
}

export async function updateReviewStatusApi(appId, status, note = null) {
  return await callAdminApi(`/api/admin/applications/${appId}/review-status`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  });
}

export async function addReviewNoteApi(appId, note) {
  return await callAdminApi(`/api/admin/applications/${appId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function overrideDecisionApi(appId, status, reason) {
  return await callAdminApi(`/api/admin/applications/${appId}/override`, {
    method: 'POST',
    body: JSON.stringify({ status, reason }),
  });
}

export async function fetchAnalyticsData() {
  return await callAdminApi('/api/admin/analytics');
}

export async function fetchAuditLogs(page = 1, pageSize = 30) {
  return await callAdminApi(`/api/admin/audit-logs?page=${page}&page_size=${pageSize}`);
}

export async function exportApplicationsCsv(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.modelPrediction) query.set('model_prediction', params.modelPrediction);
  if (params.reviewStatus) query.set('review_status', params.reviewStatus);
  if (params.dateFrom) query.set('date_from', params.dateFrom);
  if (params.dateTo) query.set('date_to', params.dateTo);
  if (params.minAmount) query.set('min_amount', params.minAmount);
  if (params.maxAmount) query.set('max_amount', params.maxAmount);
  if (params.minProb) query.set('min_prob', params.minProb);
  if (params.maxProb) query.set('max_prob', params.maxProb);
  const qs = query.toString();
  return await callAdminApi(`/api/admin/reports/csv${qs ? `?${qs}` : ''}`);
}
