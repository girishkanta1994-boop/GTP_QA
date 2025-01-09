export default defineConfig({
  // Other configurations...

  use: {
    // Base URL for the tests
    baseURL: config.url,

    // Collect trace when retrying the failed test
    trace: 'retain-on-failure', // Options: 'on', 'off', 'retain-on-failure'

    // Capture screenshots on failure
    screenshot: 'only-on-failure', // Options: 'on', 'off', 'only-on-failure'

    // Optional: Record video for debugging purposes
    video: 'retain-on-failure', // Options: 'on', 'off', 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Reporter configuration
  reporter: [
    ['list'], // Console output
    ['html'], // HTML report
    ['junit', { outputFile: 'results/junit-results.xml' }], // JUnit XML for CI
  ],
});
