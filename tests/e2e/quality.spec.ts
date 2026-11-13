import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { starterInventory } from "../../content/starter-curriculum";
import { curriculum } from "../../content/curriculum";
import { completeLesson } from "../helpers/complete-lesson";
import { choosePanel } from "../helpers/panels";
const showcase: Record<string, string> = {
  programming: "shared-python-variables",
  ai: "ai-prompt-structure",
  games: "games-motion",
  engineering: "engineering-binary",
  web: "web-structure",
  security: "security-permissions",
  robotics: "robotics-threshold",
  future: "future-sampling",
  workspace: "workspace-budget",
  opensource: "opensource-permission",
};
for (const item of starterInventory) {
  test(`${item.academyId}: module walkthrough, screenshots and retained evidence`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    const base = info.project.use.baseURL?.includes("/nexus-lab/")
      ? "./#/"
      : "/";
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    async function shot(stage: string) {
      const path = info.outputPath(`${item.academyId}-${stage}.png`);
      await page.screenshot({ path });
      await info.attach(stage, { path, contentType: "image/png" });
    }
    await page.goto(base + "course/" + item.courseId);
    await expect(
      page.getByRole("heading", { name: item.title, exact: true }),
    ).toBeVisible();
    await shot("introduction");
    for (const id of item.lessonIds) {
      await completeLesson(
        page,
        id,
        item.courseId,
        base,
        id === showcase[item.academyId]
          ? async (stage) => {
              if (stage === "interaction")
                await page
                  .locator("[data-exercise]")
                  .first()
                  .scrollIntoViewIfNeeded();
              if (stage === "feedback")
                await page.locator(".panel-result").scrollIntoViewIfNeeded();
              await shot(stage);
            }
          : undefined,
      );
    }
    await page.reload();
    await page.goto(base + "course/" + item.courseId);
    await expect(
      page.getByRole("progressbar", { name: "课程完成进度" }),
    ).toHaveAttribute("value", String(item.lessonIds.length));
    const scan = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    for (const id of new Set([item.lessonIds[0], showcase[item.academyId]])) {
      await page.goto(base + "lesson/" + id + "?course=" + item.courseId);
      await choosePanel(page, "练习");
      const scan = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    const ledger = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("nexus-curriculum-progress")!),
    );
    for (const id of item.lessonIds)
      expect(
        ledger.evidence.filter(
          (e: { kind: string; id: string }) =>
            e.kind === "lesson" && e.id === id,
        ),
      ).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}
test("quality status remains honest and quiz-only new lessons cannot save completion", async ({
  page,
}, info) => {
  const base = info.project.use.baseURL?.includes("/nexus-lab/") ? "./#/" : "/";
  await page.goto(base + "course/course.ai-starter");
  await expect(
    page.getByText("In Development · 可试学，尚未正式发布", { exact: true }),
  ).toBeVisible();
  await page.goto(base + "lesson/games-motion");
  await choosePanel(page, "练习");
  const lesson = curriculum.get("lesson", "games-motion")!;
  const assessment = curriculum.get("assessment", lesson.assessmentRefs[0].id)!;
  await page
    .getByRole("group", { name: assessment.question, exact: true })
    .getByRole("radio")
    .nth(assessment.correct)
    .check();
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.locator(".panel-result").getByRole("status")).toContainText(
    "请先通过互动练习",
  );
  const evidence = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("nexus-curriculum-progress")!).evidence,
  );
  expect(evidence).toHaveLength(0);
});
