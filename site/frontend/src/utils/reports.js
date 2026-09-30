import { useEffect, useState } from 'react';

// Test reports are published to GitHub Pages by .github/workflows/reports.yml:
// the Maven site under /reports/ and the Playwright HTML report under
// /playwright-report/. VITE_REPORTS_URL overrides the base at build time.
export const REPORTS_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REPORTS_URL) ||
  'https://dwaned.github.io/max-profit-calculator'
).replace(/\/+$/, '');

/**
 * URL of a published report. Maven site files are relative to /reports/;
 * reports flagged `external` (the Playwright bundle) sit at the site root.
 */
export function reportUrl(file, { external = false } = {}) {
  return external
    ? `${REPORTS_BASE_URL}/${file}`
    : `${REPORTS_BASE_URL}/reports/${file}`;
}

/**
 * Checks whether the published reports are reachable, so the UI can show a
 * notice instead of broken links (e.g. before the first Pages deployment).
 *
 * Returns { available, checking } so callers can render a loading state
 * while we verify.
 */
export function useReportsAvailable() {
  const [state, setState] = useState({ available: null, checking: true });
  useEffect(() => {
    let cancelled = false;
    // Probe a known report file with HEAD; treat any non-404 response as
    // "available". GitHub Pages allows cross-origin requests.
    fetch(reportUrl('surefire-report.html'), { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        setState({ available: res.status !== 404, checking: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ available: false, checking: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
