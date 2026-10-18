import { defineConfig, devices } from "@playwright/test";

const PORTA = 4173;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORTA}`;
const CI = !!process.env.CI;

/**
 * Os testes rodam contra o export real (out/) servido estaticamente, não contra o dev server:
 * o que se testa é o que o DigitalOcean vai servir. Com BASE_URL (ex.: produção) não sobe servidor.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      testIgnore: /(visual|reduced)\.spec\.ts/,
    },
    {
      name: "mobile-webkit",
      use: { ...devices["iPhone 14"] },
      testIgnore: /(visual|reduced|home-movimento)\.spec\.ts/,
    },
    {
      name: "reduced-motion",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
      testMatch: /(visual|reduced)\.spec\.ts/,
    },
    {
      name: "reduced-motion-mobile",
      use: { ...devices["iPhone 14"], reducedMotion: "reduce" },
      testMatch: /visual\.spec\.ts/,
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx serve out -l ${PORTA} --no-clipboard`,
        port: PORTA,
        reuseExistingServer: !CI,
        timeout: 30_000,
      },
});
