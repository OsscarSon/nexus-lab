import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("representative screens have no WCAG A/AA violations or horizontal overflow", async ({
  page,
}, testInfo) => {
  for (const route of [
    "/home",
    "/learn",
    "/welcome",
    "/learn/ai",
    "/learn/opensource/foundations",
    "/projects",
    "/lesson/os-source",
    "/lab/git",
    "/lab/logic",
    "/lab/spreadsheet",
    "/me",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      report.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          reason: n.failureSummary,
        })),
      })),
      route,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/home");
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.goto("/lesson/os-source");
  await page.screenshot({
    path: testInfo.outputPath("lesson.png"),
    fullPage: true,
  });
});
