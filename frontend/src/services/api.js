// Use Vite env VITE_API_URL if provided, otherwise use relative /api paths so
// the frontend works when served from the same origin (recommended for production).
const BASE = import.meta.env.VITE_API_URL || '/api';
const WORKER_BASE = `${BASE.replace(/\/$/, '')}/worker`;

const getApiWorkerBase = () => WORKER_BASE;

const healthCheck = async () => {
  try {
    const healthUrl = `${BASE.replace(/\/$/, '')}/health`;
    const res = await fetch(healthUrl, { method: 'GET' });
    const data = await res.json().catch(() => ({}));
    return { status: res.status || 200, data };
  } catch (err) {
    return { status: 0, data: { message: 'Health check failed' } };
  }
};

export const loginWorker = async (username, password) => {
  try {
    const API_URL = getApiWorkerBase();
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: { message: 'Network error or server unavailable' } };
  }
};
//const res = await axios.get("/api/salary/history");

export { healthCheck };
