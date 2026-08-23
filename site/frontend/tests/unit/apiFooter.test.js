import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shouldShowApiFooter } from '../../src/utils/apiFooter';

describe('shouldShowApiFooter', () => {
  const originalWindow = globalThis.window;
  const originalLocation = globalThis.location;

  beforeEach(() => {
    // Reset to a clean node-like environment before each test.
    delete globalThis.window;
    delete globalThis.location;
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
    if (originalLocation === undefined) {
      delete globalThis.location;
    } else {
      globalThis.location = originalLocation;
    }
    vi.restoreAllMocks();
  });

  it('returns false when apiBaseUrl differs from window.location.origin', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter('https://max-profit-calculator.onrender.com/api')).toBe(false);
  });

  it('returns true when apiBaseUrl origin matches window.location.origin', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter('http://localhost:5173/api')).toBe(true);
  });

  it('returns true when forceShow is true regardless of origin', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter('https://api.example.com/api', { forceShow: true })).toBe(true);
  });

  it('returns true when forceShow is true even if window is unavailable', () => {
    // window is deleted in beforeEach — forceShow must still win.
    expect(shouldShowApiFooter('https://api.example.com/api', { forceShow: true })).toBe(true);
  });

  it('returns false when window is unavailable (SSR / node)', () => {
    expect(shouldShowApiFooter('https://api.example.com/api')).toBe(false);
  });

  it('returns false when apiBaseUrl is not a valid URL', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter('not-a-url')).toBe(false);
  });

  it('returns false when apiBaseUrl is an empty string', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter('')).toBe(false);
  });

  it('returns false when apiBaseUrl is null or undefined', () => {
    globalThis.window = { location: { origin: 'http://localhost:5173' } };
    expect(shouldShowApiFooter(null)).toBe(false);
    expect(shouldShowApiFooter(undefined)).toBe(false);
  });
});