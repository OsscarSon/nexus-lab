import { test, expect } from "@playwright/test";
test("Git challenge checks real simulator state and supports reset", async ({
  page,
}) => {
  await page.goto("/lab/git");
  await page.getByRole("button", { name: "检查挑战" }).click();
  await expect(page.getByRole("status")).toContainText("还没完成");
  await page.getByRole("button", { name: "git switch -c" }).click();
  await page
    .getByRole("textbox", { name: "工作区 README" })
    .fill("Hello open source");
  await page.getByRole("button", { name: "git add README.md" }).click();
  await page.getByRole("button", { name: "git commit", exact: true }).click();
  await page.getByRole("button", { name: "检查挑战" }).click();
  await expect(page.getByRole("status")).toContainText("挑战通过");
  await page.getByRole("button", { name: "重置实验" }).click();
  await expect(page.getByText("尚无提交。修改 → 暂存 → 提交。")).toBeVisible();
});
test("logic gate output and independent challenge", async ({ page }) => {
  await page.goto("/lab/logic");
  await page.getByRole("button", { name: "输入 A：0" }).click();
  await page.getByRole("button", { name: "输入 B：0" }).click();
  await expect(page.getByRole("heading", { name: "输出：1" })).toBeVisible();
  for (let i = 0; i < 4; i++)
    await page
      .getByRole("combobox", { name: `第 ${i + 1} 行输出` })
      .selectOption(i === 3 ? "1" : "0");
  await page.getByRole("button", { name: "检查挑战" }).click();
  await expect(page.getByRole("status")).toContainText("挑战通过");
  await page.getByRole("button", { name: "撤销上一步" }).click();
  await page.getByRole("button", { name: "检查挑战" }).click();
  await expect(page.getByRole("status")).toContainText("检查每一行");
});
