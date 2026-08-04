const { defineConfig, devices } = require('@playwright/test');

// e2e runs against a fully isolated stack: the backend is started with
// NODE_ENV=test (see config/config.json's "test" block in the backend repo),
// which points it at the dedicated odyssey-test Postgres database - never
// the real dev/prod one. The frontend's plain `.env` file (loaded by
// `next start`, i.e. a production build) already points every
// NEXT_PUBLIC_CLIMAX_* endpoint at port 8088, which is exactly the port the
// backend webServer below is started on for e2e - no env file edits needed.
module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false, // designation-gated auth state is shared per worker; keep this simple and sequential
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Watch the run in a real browser:
    //   npx playwright test --headed
    // and optionally slow each action down so it's followable:
    //   $env:PW_SLOW_MO=500; npx playwright test --headed   (PowerShell)
    launchOptions: { slowMo: Number(process.env.PW_SLOW_MO) || 0 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npx cross-env NODE_ENV=test node index.js -p 8088',
      cwd: '../Odyssey-Backend-Server',
      url: 'http://localhost:8088/',
      // Deliberately NOT reused. The backend's own `npm start` runs on this
      // same port 8088 but WITHOUT NODE_ENV=test, so it is connected to the
      // real odyssey-prod database - reusing it would silently point this
      // whole suite (which creates jobs, invoices and ledger vouchers) at
      // production data. Failing loudly on a busy port is the safe outcome:
      // stop your dev backend first, then re-run.
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run build && npm run start',
      cwd: '.',
      url: 'http://localhost:3003/login',
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});
