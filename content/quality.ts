import type { Catalog } from "../packages/curriculum/schema";
export function applyQualityReview(catalog: Catalog): Catalog {
  for (const entity of catalog.entities)
    if (entity.kind === "course") {
      const legacy =
        entity.id === "course.opensource-literacy" ||
        ["games", "engineering", "web", "future"].some(
          (id) => entity.id === "course." + id + "-starter",
        );
      const ai = entity.id === "course.ai-starter";
      entity.quality = {
        state: legacy || ai ? "in-development" : "published",
        scores: legacy
          ? entity.id === "course.opensource-literacy"
            ? [4, 3, 2, 4, 3, 5]
            : [4, 3, 3, 4, 3, 5]
          : ai
            ? [4, 4, 3, 4, 3, 5]
            : [4, 4, 4, 4, 4, 5],
        reviewedAt: "2026-11-13",
        scope: legacy
          ? "保留旧版学习要求与证据；学科实践深度仍待升级"
          : "仅本次入门模块，不代表学院完整课程；内部功能与内容评审，非外部专家认证",
      };
    }
  return catalog;
}
