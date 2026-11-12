import { test, expect } from "@playwright/test";
test("subpath routes survive refresh and retain learning progress without backend requests", async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (r) => {
    if (/\/api(?:\/|$)/.test(new URL(r.url()).pathname))
      apiRequests.push(r.url());
  });
  await page.goto("./#/learn");
  await expect(page.locator(".academy")).toHaveCount(10);
  const route = page.url();
  await page.getByRole("link", { name: "跳到主要内容" }).focus();
  await page.keyboard.press("Enter");
  expect(page.url()).toBe(route);
  await expect(page.locator("main")).toBeFocused();
  await page.locator('.academy[href="#/learn/opensource"]').click();
  await page.getByRole("link", { name: "开始开源基础" }).click();
  await expect(page).toHaveURL(
    /\/nexus-lab\/#\/learn\/opensource\/foundations$/,
  );
  await page.reload();
  await page.getByRole("link", { name: /什么是源代码/ }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已保存学习进度");
  await page.getByRole("button", { name: "需要帮助？打开学习助手" }).click();
  await page.getByRole("textbox", { name: "你的问题" }).fill("请给我一个提示");
  await page.getByRole("button", { name: "获取帮助", exact: true }).click();
  await expect(
    page.getByText("课程引导 · 非生成式内容", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/GitHub Pages 静态版没有生成式 AI 后端/),
  ).toBeVisible();
  await page.goto("./#/me");
  await expect(page.getByText("已完成 1 / 6 节开源课程")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "本机学习模式" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "创建账户", exact: true }),
  ).toHaveCount(0);
  await page.goto("./#/settings/ai");
  await expect(page.getByText(/此处不展示服务器额度/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "透明的帮助，安心地学习。" }),
  ).toBeVisible();
  expect(apiRequests).toEqual([]);
});
test("real Python assets and worker run under the project base path", async ({
  page,
}) => {
  test.setTimeout(90000);
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  await page.goto("./#/lab/python");
  await page.getByRole("button", { name: "加载 Python 运行时" }).click();
  await expect(
    page.getByRole("button", { name: "运行 Python", exact: true }),
  ).toBeEnabled({ timeout: 60000 });
  await page.getByRole("button", { name: "运行 Python", exact: true }).click();
  await expect(page.locator("pre").last()).toHaveText("14", { timeout: 10000 });
  expect(failed).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
