import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { requestCalculation } from '../../src/api/calculator';

// Consumer-driven contract tests: the frontend's real API client
// (requestCalculation) runs against Pact's mock provider. Pact records each
// interaction the client actually performs into pacts/, which the backend then
// verifies (LocalContractVerificationTest, PactBrokerVerificationTest).
//
// Response bodies use type matchers for exactly the fields the UI reads, so the
// contract pins the shape the frontend depends on rather than incidental values.

const { integer, eachLike, string } = MatchersV3;

const PACT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../pacts');

// Pact merges new interactions into an existing pact file, so start from an
// empty one: the contract must contain exactly the interactions below.
fs.rmSync(path.join(PACT_DIR, 'frontend-max-profit-calculator-backend.json'), { force: true });

const provider = new PactV3({
  consumer: 'frontend',
  provider: 'max-profit-calculator-backend',
  dir: PACT_DIR,
  logLevel: 'warn',
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const TIMEOUT = { timeoutMs: 5000 };

describe('POST /api/calculate (frontend → backend contract)', () => {
  it('returns the chosen stocks and profit for a valid request', async () => {
    // The calculator form's default rows
    const payload = {
      savings: 10,
      buyPrices: [5, 5, 10],
      sellPrices: [15, 10, 35],
      companyNames: ['Acme Corp', 'Globex Inc', 'Initech'],
    };

    provider
      .uponReceiving('a request to calculate max profit')
      .withRequest({ method: 'POST', path: '/api/calculate', headers: JSON_HEADERS, body: payload })
      .willRespondWith({
        status: 200,
        headers: JSON_HEADERS,
        // Read by ResultsCard: profit, chosen indices, savings used/remaining, names
        body: {
          maxProfit: integer(25),
          indices: eachLike(integer(2)),
          savingsUsed: integer(10),
          remainingSavings: integer(0),
          companyNames: eachLike(string('Initech')),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const result = await requestCalculation(`${mockServer.url}/api`, payload, TIMEOUT);

      expect(result).toEqual({
        maxProfit: 25,
        indices: [2],
        savingsUsed: 10,
        remainingSavings: 0,
        companyNames: ['Initech'],
      });
    });
  });

  it('surfaces the validation message for invalid input', async () => {
    const payload = { savings: -10, buyPrices: [5, 5, 10], sellPrices: [15, 10, 35] };

    provider
      .uponReceiving('a request with invalid savings')
      .withRequest({ method: 'POST', path: '/api/calculate', headers: JSON_HEADERS, body: payload })
      .willRespondWith({
        status: 400,
        headers: JSON_HEADERS,
        // The UI shows this message to the user
        body: { message: string('Invalid input: Savings must be at least 1') },
      });

    await provider.executeTest(async (mockServer) => {
      await expect(requestCalculation(`${mockServer.url}/api`, payload, TIMEOUT))
        .rejects.toThrow('Invalid input: Savings must be at least 1');
    });
  });
});
