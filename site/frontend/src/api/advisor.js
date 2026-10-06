// Client for the stock advisor (GET /advisor/status, POST /advisor). The
// advisor needs a local Ollama model, so most deployments report it disabled
// and the page shows a recorded conversation instead.

export const ADVISOR_UNAVAILABLE_MESSAGE =
  'The advisor could not answer. It runs on a local Ollama model, which may not be running.';

/**
 * Resolves to { enabled, model }; treats any failure as disabled. The timeout
 * keeps a sleeping backend (Render's free tier takes ~30-60 s to wake) from
 * holding up the page: it simply stays on the recorded answers.
 */
export async function getAdvisorStatus(baseUrl, { timeoutMs = 4000, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseUrl}/advisor/status`, { signal: controller.signal });
    if (!response.ok) return { enabled: false, model: null };
    const status = await response.json();
    return { enabled: status.enabled === true, model: status.model ?? null };
  } catch {
    return { enabled: false, model: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Asks one question; rejects with a message that is safe to show. */
export async function askAdvisor(baseUrl, question, { timeoutMs = 120000, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
    } catch (err) {
      throw new Error(ADVISOR_UNAVAILABLE_MESSAGE, { cause: err });
    }
    if (!response.ok) {
      let message = ADVISOR_UNAVAILABLE_MESSAGE;
      if (response.status < 500) {
        try {
          message = (await response.json()).message || message;
        } catch {
          // keep the generic message
        }
      }
      throw new Error(message);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
