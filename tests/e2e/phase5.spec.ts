import { test, expect } from "@playwright/test";
import { starterInventory } from "../../content/starter-curriculum";
import { completeLesson } from "../helpers/complete-lesson";
import { choosePanel } from "../helpers/panels";
test("all ten starter modules complete through real interactions and shared once-only credit", async ({
  page,
}) => {
  test.setTimeout(180000);
  const completed = new Set<string>();
  for (const item of starterInventory) {
    await page.goto("/learn/" + item.academyId);
    await expect(
      page.getByRole("link", { name: "开始学习", exact: true }),
    ).toHaveAttribute("href", "/course/" + item.courseId);
    for (const id of item.lessonIds) {
      if (!completed.has(id)) {
        await completeLesson(page, id, item.courseId);
        completed.add(id);
      }
    }
    await page.goto("/course/" + item.courseId);
    await expect(
      page.getByRole("progressbar", { name: "课程完成进度" }),
    ).toHaveAttribute("value", String(item.lessonIds.length));
  }
  expect(completed.size).toBe(18);
  const evidence = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("nexus-curriculum-progress")!).evidence,
  );
  expect(
    evidence.filter((e: { kind: string }) => e.kind === "lesson"),
  ).toHaveLength(18);
  expect(
    evidence.filter((e: { id: string }) => e.id === "shared-api-basics"),
  ).toHaveLength(1);
  await page.goto("/projects");
  await page.getByRole("button", { name: "课程成果", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(14);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "你的创造，从这里生长。" }),
  ).toBeVisible();
});
test("new lessons reject quiz-only completion and explain missing prerequisites", async ({
  page,
}) => {
  await page.goto("/lesson/programming-expressions");
  await choosePanel(page, "练习");
  await page
    .getByRole("group", {
      name: "变量 number 从 7 改成 8，number * 2 的值是什么？",
    })
    .getByRole("radio")
    .nth(1)
    .check();
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.locator(".panel-result").getByRole("status")).toContainText(
    "请先通过互动练习",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("nexus-curriculum-progress")!).evidence,
    ),
  ).toHaveLength(0);
  await page.goto("/lesson/ai-prompt-structure");
  await page.getByText("先修与相关主题", { exact: true }).click();
  await expect(
    page.getByText(/必需：共享基础：观察、解释与预测/),
  ).toBeVisible();
});

test("standalone assessments save their own evidence without granting an unperformed lesson", async ({
  page,
}) => {
  await page.goto("/assessment/assessment.security-permissions");
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "检查测评" }).click();
  await expect(page.getByRole("status")).toContainText("尚未通过");
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "检查测评" }).click();
  await expect(page.getByRole("status")).toContainText("已保存测评证据");
  const entries = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("nexus-curriculum-progress")!).evidence,
  );
  expect(entries).toHaveLength(1);
  expect(entries[0].kind).toBe("assessment");
  await page.goto("/course/course.security-starter");
  await expect(
    page.getByRole("progressbar", { name: "课程完成进度" }),
  ).toHaveAttribute("value", "0");
});
