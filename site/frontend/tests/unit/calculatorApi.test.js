import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GENERIC_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
  TIMEOUT_MESSAGE,
  UNREACHABLE_MESSAGE,
  requestCalculation,
} from '../../src/api/calculator';

const PAYLOAD = { savings: 10, buyPrices: [5], sellPrices: [15] };

function jsonResponse(status, body) {
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// A fetch that never resolves until its signal aborts, like a hung server.
function hangingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')));
  });
}

describe('requestCalculation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('POSTs the payload as JSON and returns the parsed result', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { maxProfit: 10 }));

    const result = await requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl });

    expect(result).toEqual({ maxProfit: 10 });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/calculate');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(PAYLOAD);
  });

  it('reports a timeout with the timeout message', async () => {
    const pending = requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl: hangingFetch });
    const assertion = expect(pending).rejects.toThrow(TIMEOUT_MESSAGE);

    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it('re-throws a caller abort as AbortError so the UI can ignore it', async () => {
    const caller = new AbortController();
    const pending = requestCalculation('/api', PAYLOAD, {
      timeoutMs: 1000, signal: caller.signal, fetchImpl: hangingFetch,
    });
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    caller.abort();
    await assertion;
  });

  it('shows the backend message for a 400', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(400, { message: 'Invalid input: Savings must be at least 1' }));

    await expect(requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl }))
      .rejects.toThrow('Invalid input: Savings must be at least 1');
  });

  it('falls back to a generic message when the error body has no message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('not json', { status: 400 }));

    await expect(requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl }))
      .rejects.toThrow(GENERIC_ERROR_MESSAGE);
  });

  it('uses the service-unavailable message for 5xx responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(503, { message: 'upstream detail' }));

    await expect(requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl }))
      .rejects.toThrow(SERVER_ERROR_MESSAGE);
  });

  it('uses the unreachable message when the request fails outright', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(requestCalculation('/api', PAYLOAD, { timeoutMs: 1000, fetchImpl }))
      .rejects.toThrow(UNREACHABLE_MESSAGE);
  });
});
