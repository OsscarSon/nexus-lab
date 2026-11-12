import { test, expect } from "@playwright/test";
import { choosePanel } from "../helpers/panels";
test("new learner has a neutral start and all ten academy overviews", async ({
  page,
}) => {
  await page.goto("/home");
  await expect(
    page.getByRole("link", { name: "选择我的起点" }),
  ).toHaveAttribute("href", "/learn");
  await expect(
    page.getByRole("link", { name: "全部 10 个学院" }),
  ).toBeVisible();
  await expect(
    page.getByText("第一份进步，来自一次小小的尝试。"),
  ).toBeVisible();
  await page.goto("/learn");
  const links = await page
    .locator(".academy")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!));
  expect(links).toHaveLength(10);
  for (const link of links) {
    await page.goto(link);
    await expect(page.locator(".curriculum-level")).toHaveCount(3);
    await expect(page.locator(".level-heading h2")).toHaveText([
      "初阶",
      "进阶",
      "高阶",
    ]);
    await expect(page.locator(".objectives").first().locator("li")).toHaveCount(
      3,
    );
  }
  await page.goto("/learn/future");
  await expect(page.locator(".course-card .button")).toHaveCount(0);
  await page
    .locator(".curriculum-level")
    .filter({ has: page.getByRole("heading", { name: "高阶", exact: true }) })
    .getByRole("link", { name: "查看说明" })
    .click();
  await expect(page.getByText("规划中 · 尚未开放")).toBeVisible();
  await expect(page.getByRole("link", { name: "进入课程" })).toHaveCount(0);
});
test("actual visits personalize home without granting completion", async ({
  page,
}) => {
  await page.goto("/lab/logic");
  await expect(
    page.getByRole("heading", { name: "逻辑门实验", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("nexus-ui-history")))
    .toContain("/lab/logic");
  await page.goto("/home");
  await expect(
    page.getByRole("link", { name: "继续学习", exact: true }),
  ).toHaveAttribute("href", "/lab/logic");
  await expect(page.getByText("最近访问 · 不代表已通过")).toBeVisible();
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "还没有作品" })).toBeVisible();
});
test("existing evidence has project details and can be exported on request", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "nexus-worksheet",
      JSON.stringify({
        version: 1,
        answers: [0, 1, 2],
        completedAt: "2026-11-13T00:00:00.000Z",
      }),
    );
  });
  await page.goto("/projects");
  await page.getByRole("link", { name: "查看成果" }).click();
  await expect(
    page.getByRole("heading", { name: "开源决策工作表", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出学习证据" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("nexus-worksheet.json");
  const stream = await file.createReadStream();
  let contents = "";
  for await (const chunk of stream!) contents += chunk.toString();
  const data = JSON.parse(contents);
  expect(data.evidence.answers).toEqual([0, 1, 2]);
  await page.reload();
  await expect(page.getByText("练习检查已通过")).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("nexus-worksheet")!).version,
    ),
  ).toBe(1);
});
test("mobile tabs preserve editor state, support keyboard control and avoid bottom navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/lab/git");
  await page
    .getByRole("textbox", { name: "工作区 README" })
    .fill("My own learning state");
  await page.getByRole("tab", { name: "任务说明", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "工作区 README" }),
  ).toBeHidden();
  await page
    .getByRole("tab", { name: "任务说明", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "操作区", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("textbox", { name: "工作区 README" }),
  ).toHaveValue("My own learning state");
  await page.getByRole("button", { name: "检查挑战" }).scrollIntoViewIfNeeded();
  const button = await page
    .getByRole("button", { name: "检查挑战" })
    .boundingBox();
  const nav = await page
    .getByRole("navigation", { name: "主要导航" })
    .boundingBox();
  expect(button!.y + button!.height).toBeLessThanOrEqual(nav!.y);
  expect(
    await page
      .getByRole("navigation", { name: "主要导航" })
      .getByRole("link")
      .count(),
  ).toBe(5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/lesson/os-source");
  await choosePanel(page, "练习");
  await page.getByRole("radio").nth(1).check();
  await choosePanel(page, "学习");
  await choosePanel(page, "练习");
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.getByRole("button", { name: "检查答案" }).click();
  await expect(
    page.getByRole("tab", { name: "结果", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("status")).toContainText("已保存学习进度");
});

test("small Android-sized screens stay usable with a throttled CPU and no eager Python runtime", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 360, height: 740 });
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const runtimeRequests: string[] = [];
  page.on("request", (r) => {
    if (/\.(wasm|zip)(?:\?|$)/.test(r.url())) runtimeRequests.push(r.url());
  });
  for (const route of [
    "/home",
    "/welcome",
    "/learn",
    "/learn/robotics",
    "/lab",
    "/lab/python",
    "/projects",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  expect(runtimeRequests).toEqual([]);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 1 });
});

test("legacy progress without visit metadata still resumes, and Python-only learners are not directed to another academy", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "nexus-progress",
      JSON.stringify({ version: 1, completed: ["os-source"] }),
    );
  });
  await page.goto("/home");
  await expect(
    page.getByRole("link", { name: "继续学习", exact: true }),
  ).toHaveAttribute(
    "href",
    "/lesson/os-permissions?course=course.opensource-literacy",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("nexus-progress")!).completed,
    ),
  ).toEqual(["os-source"]);
  await page.evaluate(() => {
    localStorage.removeItem("nexus-progress");
    localStorage.setItem(
      "nexus-python-variables",
      JSON.stringify({ output: "14", completedAt: "2026-11-13T00:00:00.000Z" }),
    );
  });
  await page.reload();
  await expect(
    page.getByRole("link", { name: "继续学习", exact: true }),
  ).toHaveAttribute("href", "/lab/python");
  await expect(page.locator(".mini-stat")).toContainText("已验证的练习");
  await expect(page.getByText("开源素养 M01 · 共 6 节")).toHaveCount(0);
});
