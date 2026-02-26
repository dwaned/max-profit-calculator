import { Pact, LogLevel } from '@pact-foundation/pact';
import { afterAll, beforeAll } from 'vitest';

const pactDir = './pacts';

export const setupPact = () => {
  const consumerName = 'frontend';
  const providerName = 'max-profit-calculator-backend';

  const pact = new Pact({
    consumer: consumerName,
    provider: providerName,
    dir: pactDir,
    logLevel: LogLevel.DEBUG,
    port: 3000,
  });

  beforeAll(async () => {
    await pact.setup();
  });

  afterAll(async () => {
    await pact.finalize();
  });

  return { pact, consumerName, providerName };
};

export default setupPact;
