import { describe, expect, it } from 'vitest';
import { ADVISOR_UNAVAILABLE_MESSAGE, askAdvisor, getAdvisorStatus } from '../../src/api/advisor';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('getAdvisorStatus', () => {
  it('reports the status from the API', async () => {
    const fetchImpl = async (url) => {
      expect(url).toBe('http://api/advisor/status');
      return jsonResponse(200, { enabled: true, model: 'qwen3.5:4b' });
    };
    expect(await getAdvisorStatus('http://api', { fetchImpl })).toEqual({ enabled: true, model: 'qwen3.5:4b' });
  });

  it('gives up on a slow (sleeping) backend instead of making the page wait', async () => {
    const hanging = (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    });
    expect(await getAdvisorStatus('http://api', { timeoutMs: 10, fetchImpl: hanging }))
      .toEqual({ enabled: false, model: null });
  });

  it('treats errors and unreachable servers as disabled', async () => {
    expect(await getAdvisorStatus('http://api', { fetchImpl: async () => jsonResponse(404, {}) }))
      .toEqual({ enabled: false, model: null });
    expect(await getAdvisorStatus('http://api', { fetchImpl: async () => { throw new TypeError('offline'); } }))
      .toEqual({ enabled: false, model: null });
  });
});

describe('askAdvisor', () => {
  it('posts the question and returns the answer', async () => {
    const fetchImpl = async (url, init) => {
      expect(url).toBe('http://api/advisor');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body)).toEqual({ question: 'Which?' });
      return jsonResponse(200, { answer: 'Buy stock 2', verified: true });
    };
    expect(await askAdvisor('http://api', 'Which?', { fetchImpl })).toEqual({ answer: 'Buy stock 2', verified: true });
  });

  it('shows the API message for client errors and a safe message otherwise', async () => {
    await expect(askAdvisor('http://api', '', { fetchImpl: async () => jsonResponse(400, { message: 'Invalid input: Question is required' }) }))
      .rejects.toThrow('Invalid input: Question is required');
    await expect(askAdvisor('http://api', 'Hi', { fetchImpl: async () => jsonResponse(503, { message: 'internal detail' }) }))
      .rejects.toThrow(ADVISOR_UNAVAILABLE_MESSAGE);
    await expect(askAdvisor('http://api', 'Hi', { fetchImpl: async () => { throw new TypeError('offline'); } }))
      .rejects.toThrow(ADVISOR_UNAVAILABLE_MESSAGE);
  });
});
