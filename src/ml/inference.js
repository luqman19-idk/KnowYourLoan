/**
 * Client-side interface to KnowYourLoan CatBoost & SHAP backend
 */

const API_BASE_CANDIDATES = [
  '', // Relative path using Vite proxy (/predict, /explain, etc.)
  'http://127.0.0.1:8000',
  'http://localhost:8000',
];

async function callEndpoint(path, method = 'GET', body = null) {
  let lastError = null;

  for (const base of API_BASE_CANDIDATES) {
    const url = `${base}${path}`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        let errMessage = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      // If network connection refused on relative or local, try next candidate
      continue;
    }
  }

  throw lastError || new Error(`Failed to communicate with KnowYourLoan API at ${path}`);
}

export async function checkBackendHealth() {
  return await callEndpoint('/health', 'GET');
}

export async function predictLoan(applicationData) {
  return await callEndpoint('/predict', 'POST', applicationData);
}

export async function explainLoan(applicationData) {
  return await callEndpoint('/explain', 'POST', applicationData);
}
