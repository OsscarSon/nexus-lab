import { expect, type Page } from "@playwright/test";
import { curriculum } from "../../content/curriculum";
import type { Interaction } from "../../packages/curriculum/schema";
import { choosePanel } from "./panels";
import { exerciseProofs } from "../fixtures/curriculum-proofs";
async function completeLab(
  page: Page,
  block: Extract<Interaction, { kind: "lab-evidence" }>,
) {
  const popupEvent = page.waitForEvent("popup");
  await page.getByRole("link", { name: /打开.*实验 ↗/ }).click();
  const lab = await popupEvent;
  await expect(lab.locator("h1")).toBeVisible();
  if (block.labRef.id === "lab.python-variables") {
    await lab.getByRole("button", { name: "加载 Python 运行时" }).click();
    await expect(
      lab.getByRole("button", { name: "运行 Python", exact: true }),
    ).toBeEnabled({ timeout: 60000 });
    await lab.getByRole("button", { name: "运行 Python", exact: true }).click();
    await expect(lab.getByRole("status")).toContainText("挑战通过", {
      timeout: 10000,
    });
    await expect(lab.locator("pre").last()).toHaveText("14");
  } else {
    await lab.getByRole("button", { name: "git switch -c" }).click();
    await lab
      .getByRole("textbox", { name: "工作区 README" })
      .fill("Hello open source");
    await lab.getByRole("button", { name: "git add README.md" }).click();
    await lab.getByRole("button", { name: "git commit", exact: true }).click();
    await lab.getByRole("button", { name: "检查挑战" }).click();
    await expect(lab.getByRole("status")).toContainText("挑战通过");
  }
  await lab.close();
  await page.getByRole("button", { name: "验证已保存实验" }).click();
}
export async function completeLesson(
  page: Page,
  id: string,
  courseId?: string,
  base = "/",
  onStage?: (stage: "interaction" | "feedback") => Promise<void>,
) {
  const lesson = curriculum.get("lesson", id)!;
  await page.goto(
    base + "lesson/" + id + (courseId ? "?course=" + courseId : ""),
  );
  await expect(
    page.getByRole("heading", { name: lesson.title, exact: true }),
  ).toBeVisible();
  await choosePanel(page, "练习");
  const block = lesson.blocks[0];
  if (block?.kind !== "repository" && block) {
    const exercise = page.locator('[data-exercise="' + block.id + '"]');
    if (["motion", "binary", "markup", "sampling"].includes(block.kind)) {
      const name = {
        motion: "检查运动挑战",
        binary: "检查二进制挑战",
        markup: "检查网页结构",
        sampling: "检查采样挑战",
      }[block.kind as "motion" | "binary" | "markup" | "sampling"];
      await exercise.getByRole("button", { name, exact: true }).click();
      await expect(exercise.getByRole("status")).toContainText("还需调整");
    }
    switch (block.kind) {
      case "motion":
        await exercise
          .getByRole("combobox", { name: "移动速度" })
          .selectOption("3");
        for (let n = 0; n < 4; n++)
          await exercise.getByRole("button", { name: "向右移动" }).click();
        await exercise.getByRole("button", { name: "检查运动挑战" }).click();
        break;
      case "binary":
        for (const n of [8, 2])
          await exercise
            .getByRole("button", { name: `位权 ${n}`, exact: true })
            .click();
        await exercise.getByRole("button", { name: "检查二进制挑战" }).click();
        for (const n of [8, 4, 2, 1])
          await exercise
            .getByRole("button", { name: `位权 ${n}`, exact: true })
            .click();
        await exercise.getByRole("button", { name: "检查二进制挑战" }).click();
        break;
      case "markup":
        await exercise
          .getByRole("textbox", { name: "HTML 源码" })
          .fill(
            '<h1>我的活动</h1><p>欢迎参加</p><button type="button">了解活动</button>',
          );
        await exercise.getByRole("button", { name: "检查网页结构" }).click();
        break;
      case "sampling":
        await exercise.getByRole("combobox").selectOption("4");
        await exercise.getByRole("combobox").selectOption("8");
        await exercise.getByRole("button", { name: "检查采样挑战" }).click();
        break;
      case "numeric":
        await exercise.getByRole("spinbutton").fill(String(exerciseProofs[id]));
        await exercise
          .getByRole("button", { name: "检查练习", exact: true })
          .click();
        break;
      case "prompt":
        for (const [name, value] of [
          ["任务目标", "总结活动通知"],
          ["目标读者", "小学生"],
          ["输出约束", "三句话"],
        ])
          await exercise
            .getByRole("textbox", { name, exact: true })
            .fill(value);
        await exercise.getByRole("button", { name: "检查提示结构" }).click();
        break;
      case "game":
        for (let i = 0; i < block.target; i++)
          await exercise.getByRole("button", { name: "收集一颗星" }).click();
        await exercise.getByRole("button", { name: "检查胜利条件" }).click();
        break;
      case "logic":
        for (let i = 0; i < 4; i++)
          await exercise
            .getByRole("combobox", { name: `练习第 ${i + 1} 行` })
            .selectOption(i === 3 ? "1" : "0");
        await exercise.getByRole("button", { name: "检查真值表" }).click();
        break;
      case "request":
        await exercise
          .getByRole("combobox", { name: "HTTP 方法" })
          .selectOption("GET");
        await exercise
          .getByRole("textbox", { name: "资源路径" })
          .fill(block.path);
        await exercise.getByRole("button", { name: "检查请求报文" }).click();
        break;
      case "permissions":
        await exercise
          .getByRole("checkbox", { name: "read:temperature", exact: true })
          .check();
        await exercise.getByRole("button", { name: "检查权限选择" }).click();
        break;
      case "sensor":
        await exercise
          .getByRole("radio", { name: "开启", exact: true })
          .check();
        await exercise.getByRole("button", { name: "检查控制预测" }).click();
        break;
      case "classification":
        for (let i = 0; i < block.claims.length; i++)
          await exercise
            .getByRole("combobox")
            .nth(i)
            .selectOption(block.claims[i].category);
        await exercise.getByRole("button", { name: "检查分类" }).click();
        break;
      case "formula":
        await exercise
          .getByRole("textbox", { name: "预算公式" })
          .fill("=SUM(B2:B3)");
        await exercise.getByRole("button", { name: "检查预算公式" }).click();
        break;
      case "lab-evidence":
        await completeLab(page, block);
        break;
    }
    await expect(exercise.getByRole("status")).toContainText("练习检查通过");
  }
  await onStage?.("interaction");
  if (onStage) {
    for (const r of lesson.assessmentRefs) {
      const a = curriculum.get("assessment", r.id)!;
      await page
        .getByRole("group", { name: a.question, exact: true })
        .getByRole("radio")
        .nth((a.correct + 1) % a.options.length)
        .check();
    }
    await page.getByRole("button", { name: "检查答案", exact: true }).click();
    await expect(
      page.locator(".panel-result").getByRole("status"),
    ).toContainText("再想一想");
    await choosePanel(page, "练习");
  }
  for (const r of lesson.assessmentRefs) {
    const a = curriculum.get("assessment", r.id)!;
    await page
      .getByRole("group", { name: a.question, exact: true })
      .getByRole("radio")
      .nth(a.correct)
      .check();
  }
  await page.getByRole("button", { name: "检查答案", exact: true }).click();
  await expect(page.locator(".panel-result").getByRole("status")).toContainText(
    "已保存学习进度",
  );
  await onStage?.("feedback");
}
