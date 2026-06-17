import { useEffect, useState } from 'react';

/**
 * Checks whether the reports directory is reachable. If not, the UI should
 * show a disabled state instead of broken links (#3 — all links 404 in
 * production because reports aren't copied into the frontend build).
 *
 * Returns { available, checking } so callers can render a loading state
 * while we verify.
 */
export function useReportsAvailable() {
  const [state, setState] = useState({ available: null, checking: true });
  useEffect(() => {
    let cancelled = false;
    // Probe a known report file with HEAD; treat any non-404 response as
    // "available". 200/301/302/304 = available, 404 = unavailable.
    fetch('/reports/surefire-report.html', { method: 'HEAD' })
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
