// Client for POST /calculate. Maps every failure to an Error whose message is
// safe to show to the user; an abort requested by the caller (unmount, newer
// request) is re-thrown as an AbortError so the UI can ignore it.

export const TIMEOUT_MESSAGE =
  'The API took too long to respond. The backend may be waking up on the free tier — please try again in a moment.';
export const SERVER_ERROR_MESSAGE =
  'Service is currently unavailable. Please ensure the backend is running.';
export const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please check your input values and try again.';
export const UNREACHABLE_MESSAGE =
  'Unable to connect to the server. Please make sure the backend is running.';

export async function requestCalculation(
  baseUrl,
  payload,
  { timeoutMs, signal, fetchImpl = fetch } = {},
) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        if (timedOut) throw new Error(TIMEOUT_MESSAGE, { cause: err });
        throw err;
      }
      throw new Error(UNREACHABLE_MESSAGE, { cause: err });
    }

    if (!response.ok) {
      throw new Error(await errorMessageFor(response));
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

async function errorMessageFor(response) {
  if (response.status >= 500) return SERVER_ERROR_MESSAGE;
  try {
    const text = await response.text();
    return (text && JSON.parse(text).message) || GENERIC_ERROR_MESSAGE;
  } catch {
    return GENERIC_ERROR_MESSAGE;
  }
}
