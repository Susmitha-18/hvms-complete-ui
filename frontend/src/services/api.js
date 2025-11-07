// Resolution order for API base URL (most to least specific):
// 1. runtime override: window.__HVMS_API_URL (settable at runtime without rebuild)
// 2. build-time Vite env: import.meta.env.VITE_API_URL
// 3. fallback to same-origin '/api'
const getRuntimeApi = () => (typeof window !== 'undefined' && window.__HVMS_API_URL) || undefined;
const getBuildApi = () => {
  try {
    return (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || undefined;
  } catch (e) {
    return undefined;
  }
};

const API_BASE = getRuntimeApi() || getBuildApi() || '/api';

// Helpful debug info: print which source provided the API URL so it's easier
// to diagnose deployment issues.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[frontend] API base resolved to', API_BASE);
  if (getRuntimeApi()) {
    // eslint-disable-next-line no-console
    console.info('[frontend] Source: window.__HVMS_API_URL (runtime override)');
  } else if (getBuildApi()) {
    // eslint-disable-next-line no-console
    console.info('[frontend] Source: import.meta.env.VITE_API_URL (build time)');
  } else {
    // eslint-disable-next-line no-console
    console.info('[frontend] Source: fallback /api (same-origin)');
  }
}

// Allow setting runtime API url from the browser console or an injected script
// (useful when you can't rebuild on the host immediately).
export const setRuntimeApiUrl = (url) => {
  if (typeof window !== 'undefined') window.__HVMS_API_URL = url;
};

// API_ROOT is the base origin/root (without the trailing '/api') so we can set
// axios baseURL safely and also build full URLs for native fetch when needed.
const API_ROOT = API_BASE.replace(/\/api\/?$/i, '');

// Expose API_BASE (may include '/api') for callers that want to construct paths.
export { API_BASE };

// axios: set default base URL to the API root. When running in dev with
// API_BASE === '/api' this results in empty string and axios will use the
// browser origin (so requests to '/api/...' remain relative). When deployed
// with a full URL (https://.../api) this sets axios to the API host.
import axios from 'axios';
axios.defaults.baseURL = API_ROOT || '';

// Helper for native fetch requests: if API_BASE is an absolute URL (starts
// with http) then prefix the path with the API_ROOT; otherwise keep the
// relative path so it works with same-origin setups during development.
const apiFetch = (path, options) => {
  // If caller passed a full absolute URL, just use it as-is.
  if (typeof path === 'string' && /^https?:\/\//i.test(path)) {
    return fetch(path, options);
  }

  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const useFull = /^https?:\/\//i.test(API_BASE);
  const url = useFull ? API_ROOT.replace(/\/$/, '') + normalizedPath : normalizedPath;
  return fetch(url, options);
};

const WORKER_BASE = `${API_BASE.replace(/\/$/, '')}/worker`;
const getApiWorkerBase = () => WORKER_BASE;

const healthCheck = async () => {
  try {
    const healthUrl = `${API_BASE.replace(/\/$/, '')}/health`;
    const res = await apiFetch(healthUrl, { method: 'GET' });
    const data = await res.json().catch(() => ({}));
    return { status: res.status || 200, data };
  } catch (err) {
    return { status: 0, data: { message: 'Health check failed' } };
  }
};

export const loginWorker = async (username, password) => {
  try {
    const API_URL = getApiWorkerBase();
    const res = await apiFetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: { message: 'Network error or server unavailable' } };
  }
};

export { healthCheck, getApiWorkerBase, apiFetch };
