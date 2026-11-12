import { test, expect } from "@playwright/test";
test("learner chooses a goal and browses all academies", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "找到我的起点" }).click();
  await expect(page.getByRole("radio")).toHaveCount(10);
  await expect(page.locator("input[type=radio]:checked")).toHaveCount(0);
  await page.getByRole("radio", { name: /开源学院/ }).check();
  await page.getByRole("button", { name: "开始探索" }).click();
  await expect(
    page.getByRole("heading", { name: "开源学院", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.goto("/me");
  await expect(page.getByText("当前方向：开源学院")).toBeVisible();
  await page.goto("/learn");
  await expect(page.locator(".academy")).toHaveCount(10);
  await page.getByPlaceholder("例如：开源、Programming").fill("not-found");
  await expect(page.getByRole("status")).toContainText("没有找到");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
