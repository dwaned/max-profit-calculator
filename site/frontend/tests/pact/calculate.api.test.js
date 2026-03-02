import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Matchers } from '@pact-foundation/pact';

const { like } = Matchers;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pact Consumer Contract Tests - tests the contract between frontend and backend
describe('Pact Consumer Contract Tests', () => {
  it('should generate pact contract for calculate endpoint', async () => {
    const pact = {
      consumer: {
        name: 'frontend',
      },
      provider: {
        name: 'max-profit-calculator-backend',
      },
      interactions: [
        {
          description: 'a request to calculate max profit - returns calculated values',
          request: {
            method: 'POST',
            path: '/api/calculate',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              savings: 10,
              buyPrices: [5, 5, 10],
              sellPrices: [15, 10, 35],
              companyNames: ['Acme Corp', 'Globex Inc', 'Initech'],
            },
          },
          response: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: like({
              maxProfit: 20,
              indices: [0, 1],
              savingsUsed: 10,
              remainingSavings: 0,
              companyNames: ['Acme Corp', 'Globex Inc'],
            }),
          },
        },
        {
          description: 'a request with invalid savings',
          request: {
            method: 'POST',
            path: '/api/calculate',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              savings: -10,
              buyPrices: [5, 5, 10],
              sellPrices: [15, 10, 35],
            },
          },
          response: {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
            body: like({
              message: 'Invalid input: Savings must be at least 1',
            }),
          },
        },
        {
          description: 'a health check request',
          request: {
            method: 'GET',
            path: '/api/health',
          },
          response: {
            status: 200,
            headers: {
              'Content-Type': 'text/plain',
            },
            body: 'OK',
          },
        },
      ],
      metadata: {
        pactSpecification: {
          version: '3.0.0',
        },
      },
    };

    const pactDir = path.resolve(__dirname, '../../pacts');
    if (!fs.existsSync(pactDir)) {
      fs.mkdirSync(pactDir, { recursive: true });
    }

    const pactFile = path.resolve(pactDir, 'frontend-max-profit-calculator-backend.json');
    fs.writeFileSync(pactFile, JSON.stringify(pact, null, 2));

    expect(fs.existsSync(pactFile)).toBe(true);
    console.log('Pact file generated at:', pactFile);
  });
});
