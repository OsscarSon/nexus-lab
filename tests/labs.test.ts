import { describe, it, expect } from "vitest";
import {
  gitLab,
  logicLab,
  gateOutput,
  type Gate,
} from "../packages/lab-contracts";
describe("Git simulator", () => {
  it("commits the staged snapshot, not later edits, and requires a feature branch", () => {
    let s = gitLab.initial();
    s = gitLab.update(s, { type: "commit", message: "empty" });
    expect(s.commits).toHaveLength(0);
    s = gitLab.update(s, { type: "edit", content: "Hello open source" });
    s = gitLab.update(s, { type: "stage" });
    s = gitLab.update(s, { type: "edit", content: "later edit" });
    s = gitLab.update(s, { type: "commit", message: "first" });
    expect(s.commits[0].content).toBe("Hello open source");
    expect(gitLab.evaluate(s).passed).toBe(false);
    s = gitLab.update(s, { type: "branch", name: "feature" });
    s = gitLab.update(s, { type: "edit", content: "Hello open source" });
    s = gitLab.update(s, { type: "stage" });
    s = gitLab.update(s, { type: "commit", message: "feature" });
    expect(gitLab.evaluate(s).passed).toBe(true);
  });
});
describe("logic simulation", () => {
  it.each<[Gate, boolean[]]>([
    ["AND", [false, false, false, true]],
    ["OR", [false, true, true, true]],
    ["XOR", [false, true, true, false]],
    ["NOT", [true, true, false, false]],
  ])("evaluates every %s truth-table input", (gate, expected) => {
    expect(
      [0, 1, 2, 3].map((i) => gateOutput(gate, Boolean(i & 2), Boolean(i & 1))),
    ).toEqual(expected);
    let s = logicLab.update(logicLab.initial(), {
      type: "configure",
      gate,
      a: false,
      b: false,
    });
    expect(logicLab.evaluate(s).passed).toBe(false);
    expected.forEach((value, row) => {
      s = logicLab.update(s, { type: "predict", row, value });
    });
    expect(logicLab.evaluate(s).passed).toBe(true);
  });
});
