import { choosePanel } from "../helpers/panels";
import { test, expect } from "@playwright/test";
test("optional accounts sync progress across browser contexts, logout and delete", async ({
  page,
  browser,
}) => {
  await page.goto("/me");
  await page
    .getByRole("textbox", { name: "用户名", exact: true })
    .fill("student_" + Date.now().toString(36));
  const username = await page
    .getByRole("textbox", { name: "用户名", exact: true })
    .inputValue();
  await page.getByLabel("密码（至少 12 个字符）").fill("test-password-123");
  await page.getByRole("button", { name: "创建账户" }).click();
  await expect(
    page.getByRole("heading", { name: "你好，" + username }),
  ).toBeVisible();
  await page.goto("/lesson/os-source");
  await choosePanel(page, "练习");
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已保存学习进度");
  await page.goto("/me");
  await page.getByRole("button", { name: "同步课程进度" }).click();
  await expect(page.getByRole("status")).toContainText("同步成功");
  const context = await browser.newContext();
  const second = await context.newPage();
  await second.goto("http://127.0.0.1:5173/me");
  await second
    .getByRole("textbox", { name: "用户名", exact: true })
    .fill(username);
  await second.getByLabel("密码（至少 12 个字符）").fill("test-password-123");
  await second.getByRole("button", { name: "登录", exact: true }).click();
  await expect(
    second.getByRole("heading", { name: "你好，" + username }),
  ).toBeVisible();
  await second.getByRole("button", { name: "同步课程进度" }).click();
  await expect(second.getByText("已完成 1 / 6 节开源课程")).toBeVisible();
  await second.getByRole("button", { name: "退出登录" }).click();
  await expect(
    second.getByRole("button", { name: "登录", exact: true }),
  ).toBeVisible();
  await context.close();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "删除账户", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("账户与同步进度已删除");
});
test("all mentor modes remain explicitly non-generative without credentials", async ({
  page,
}) => {
  await page.goto("/lesson/os-source");
  await page.getByRole("button", { name: "需要帮助？打开学习助手" }).click();
  for (const mode of ["explain", "hint", "debug", "build"]) {
    await page.getByRole("combobox", { name: "教学模式" }).selectOption(mode);
    await page
      .getByRole("textbox", { name: "你的问题" })
      .fill("如何理解这节课？");
    await page.getByRole("button", { name: "获取帮助", exact: true }).click();
    await expect(
      page.getByText("课程引导 · 非生成式内容", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/平台 AI 尚未启用/)).toBeVisible();
  }
  await page.goto("/settings/ai");
  await expect(
    page.getByText("生成式 AI：未启用，提供非生成式课程引导"),
  ).toBeVisible();
});
test("rate-limited and disconnected help remain honest and readable", async ({
  page,
}) => {
  await page.goto("/lesson/os-source");
  await page.getByRole("button", { name: "需要帮助？打开学习助手" }).click();
  await page.getByRole("textbox", { name: "你的问题" }).fill("需要提示");
  await page.route("**/api/mentor/chat", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "请求太频繁" }),
    }),
  );
  await page.getByRole("button", { name: "获取帮助", exact: true }).click();
  await expect(page.getByText(/请求过于频繁/)).toBeVisible();
  await page.unroute("**/api/mentor/chat");
  await page.route("**/api/mentor/chat", (route) => route.abort());
  await page.getByRole("button", { name: "获取帮助", exact: true }).click();
  await expect(page.getByText(/网络或服务不可用/)).toBeVisible();
  await expect(
    page.getByText("课程引导 · 非生成式内容", { exact: true }),
  ).toBeVisible();
});
