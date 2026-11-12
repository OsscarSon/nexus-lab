import { test, expect } from "@playwright/test";
test("complete the course with feedback and persist evidence", async ({
  page,
}) => {
  await page.goto("/lesson/os-source");
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("再想一想");
  const answers = [1, 2, 0, 1, 2, 0];
  for (let i = 0; i < 6; i++) {
    await page.getByRole("radio").nth(answers[i]).check();
    await page.getByRole("button", { name: "检查答案", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("已保存学习进度");
    await page
      .getByRole("link", { name: i === 5 ? "进入模块检查" : "下一课" })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "开源决策工作表", exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++)
    await page.locator("fieldset").nth(i).getByRole("radio").nth(i).check();
  await page.getByRole("button", { name: "检查工作表" }).click();
  await expect(page.getByRole("status")).toContainText("全部正确");
  await page.reload();
  await page.goto("/me");
  await expect(page.getByText("已完成 6 / 6 节开源课程")).toBeVisible();
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "开源决策工作表" }),
  ).toBeVisible();
});
