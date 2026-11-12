import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "pnpm dev",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      env: { NEXUS_DEV_API_TARGET: "http://127.0.0.1:3101" },
    },
    {
      command: "pnpm start",
      url: "http://127.0.0.1:3101/api/health",
      reuseExistingServer: false,
      env: {
        PORT: "3101",
        NEXUS_DB_PATH: `.cache/e2e-${Date.now()}.sqlite`,
        NEXUS_AI_ENABLED: "false",
      },
    },
  ],
});
