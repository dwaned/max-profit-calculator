// VITE_API_URL is set at build time (render.yaml, docker compose). Without it,
// the dev server (npm run dev) uses /api, which Vite proxies to the local
// backend on :9095; a production build falls back to the deployed backend.
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const API_BASE_URL =
  env.VITE_API_URL || (env.DEV ? '/api' : 'https://max-profit-calculator.onrender.com/api');
