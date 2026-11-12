import { test, expect } from "@playwright/test";
test("runs real Pyodide in a worker and completes each micro lesson", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/lab/python");
  let wasmRequests = 0;
  page.on("request", (r) => {
    if (r.url().endsWith(".wasm")) wasmRequests++;
  });
  expect(wasmRequests).toBe(0);
  await page.getByRole("button", { name: "加载 Python 运行时" }).click();
  await expect(
    page.getByRole("button", { name: "运行 Python", exact: true }),
  ).toBeEnabled({ timeout: 60000 });
  for (const [id, result] of [
    ["variables", "14"],
    ["loops", "15"],
    ["functions", "True"],
  ]) {
    await page.getByRole("combobox", { name: "课程示例" }).selectOption(id);
    await page
      .getByRole("button", { name: "运行 Python", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("挑战通过", {
      timeout: 10000,
    });
    await expect(page.locator("pre").last()).toHaveText(result);
  }
  expect(wasmRequests).toBeGreaterThan(0);
  await page.getByRole("button", { name: "停止并重置运行时" }).click();
  await expect(
    page.getByRole("button", { name: "加载 Python 运行时" }),
  ).toBeVisible();
});
test("spreadsheet computes changes and reports unsupported functions", async ({
  page,
}) => {
  await page.goto("/lab/spreadsheet");
  await page.getByRole("textbox", { name: "B2", exact: true }).fill("20");
  await expect(page.getByRole("row", { name: /B4 合计/ })).toContainText("38");
  await page.getByRole("button", { name: "计算并检查" }).click();
  await expect(page.getByRole("status")).toContainText("挑战通过");
  await page.getByRole("textbox", { name: /挑战公式/ }).fill("=IF(1,2,3)");
  await page.getByRole("button", { name: "计算并检查" }).click();
  await expect(page.getByRole("status")).toContainText("不支持");
  await page.getByRole("textbox", { name: /挑战公式/ }).fill("=30");
  await page.getByRole("button", { name: "计算并检查" }).click();
  await expect(page.getByRole("status")).toContainText("还没通过");
});
