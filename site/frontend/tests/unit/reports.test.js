import { describe, expect, it } from 'vitest';
import { REPORTS_BASE_URL, reportUrl } from '../../src/utils/reports';
import { layerReports } from '../../src/data/reports';
import { testLayers } from '../../src/data/testLayers';

describe('reportUrl', () => {
  it('defaults to the GitHub Pages site without a trailing slash', () => {
    expect(REPORTS_BASE_URL).toBe('https://dwaned.github.io/max-profit-calculator');
  });

  it('places Maven site files under /reports/', () => {
    expect(reportUrl('jacoco/index.html'))
      .toBe('https://dwaned.github.io/max-profit-calculator/reports/jacoco/index.html');
  });

  it('keeps anchors on report files', () => {
    expect(reportUrl('surefire-report.html#com.maxprofit.calculator.StressTests'))
      .toBe('https://dwaned.github.io/max-profit-calculator/reports/surefire-report.html#com.maxprofit.calculator.StressTests');
  });

  it('places external reports at the site root', () => {
    expect(reportUrl('playwright-report/index.html', { external: true }))
      .toBe('https://dwaned.github.io/max-profit-calculator/playwright-report/index.html');
  });
});

describe('Reports page data', () => {
  it('has reports for every layer of the pyramid, and only for real layers', () => {
    expect(Object.keys(layerReports).sort()).toEqual(testLayers.map((l) => l.id).sort());
  });

  it('gives every layer link a destination', () => {
    const missing = Object.entries(layerReports)
      .flatMap(([id, { links }]) => links.map((link) => ({ id, ...link })))
      .filter((link) => !link.file && !link.href)
      .map((link) => `${link.id}: ${link.label}`);
    expect(missing).toEqual([]);
  });
});
