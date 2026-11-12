import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/pages",
  outputDir: "test-results/pages",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173/nexus-lab/",
    headless: true,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command:
      "pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort --mode pages",
    url: "http://127.0.0.1:4173/nexus-lab/",
    reuseExistingServer: false,
  },
});
