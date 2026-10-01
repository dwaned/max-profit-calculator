import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // Pact tests start a mock provider and write pacts/; run them with `npm run test:pact`.
    exclude: ['tests/pact/**', 'node_modules/**'],
  },
});
