/**
 * Determines whether the API base URL footer should be visible.
 *
 * The footer is shown only when:
 *   - `forceShow` is true (e.g. via `VITE_SHOW_API_FOOTER=true`), OR
 *   - `apiBaseUrl` is a valid URL whose origin matches `window.location.origin`
 *     (i.e. same-origin — the SPA is actually using this backend).
 *
 * Returns `false` when `apiBaseUrl` is not a valid URL or when `window`
 * is unavailable (e.g. SSR / node).
 *
 * @param {string} apiBaseUrl the configured API base URL (e.g. "https://api.example.com/api")
 * @param {object} [options]
 * @param {boolean} [options.forceShow=false] opt-in to always show the footer
 * @returns {boolean}
 */
export function shouldShowApiFooter(apiBaseUrl, options = {}) {
  if (options && options.forceShow) {
    return true;
  }
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  if (typeof apiBaseUrl !== 'string' || apiBaseUrl.length === 0) {
    return false;
  }
  try {
    const apiOrigin = new URL(apiBaseUrl).origin;
    return apiOrigin === window.location.origin;
  } catch {
    return false;
  }
}