import { test, expect } from "@playwright/test";
test("production server serves SPA routes, bounded real Python and fallback under CSP", async ({
  page,
}) => {
  test.setTimeout(90000);
  const response = await page.goto("/lab/python");
  expect(response?.headers()["content-security-policy"]).toContain(
    "script-src 'self' 'wasm-unsafe-eval'",
  );
  await page.getByRole("button", { name: "加载 Python 运行时" }).click();
  await expect(
    page.getByRole("button", { name: "运行 Python", exact: true }),
  ).toBeEnabled({ timeout: 60000 });
  await page.getByRole("button", { name: "运行 Python", exact: true }).click();
  await expect(page.locator("pre").last()).toHaveText("14", { timeout: 10000 });
  await page.goto("/lesson/os-source");
  await page.getByRole("button", { name: "需要帮助？打开学习助手" }).click();
  await page.getByRole("textbox", { name: "你的问题" }).fill("如何开始");
  await page.getByRole("button", { name: "获取帮助", exact: true }).click();
  await expect(
    page.getByText("课程引导 · 非生成式内容", { exact: true }),
  ).toBeVisible();
});
