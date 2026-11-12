import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/production",
  outputDir: "test-results/production",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3002",
    headless: true,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3002/api/health",
    env: {
      PORT: "3002",
      NEXUS_DB_PATH: ".cache/production-smoke.sqlite",
      NEXUS_AI_ENABLED: "false",
      NODE_ENV: "production",
      NEXUS_APP_ORIGIN: "http://127.0.0.1:3002",
    },
  },
});
