// VITE_API_URL is set at build time via render.yaml env vars / .env files.
// When unset we fall back to the known deployed backend URL so the footer is
// always accurate (#6 — was previously hard-coded as a misleading "/api").
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'https://max-profit-calculator.onrender.com/api';
