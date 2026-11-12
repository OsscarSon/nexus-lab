import { describe, it, expect } from "vitest";
import { evaluateFormula, evaluateCell } from "../packages/formulas";
describe("spreadsheet subset", () => {
  const cells = { A1: "2", A2: "3", A3: "=A1+A2" };
  it.each([
    ["=SUM(A1:A3)", 10],
    ["=AVERAGE(A1,A2)", 2.5],
    ["=MIN(A1:A3)", 2],
    ["=MAX(A1:A3)", 5],
    ["=2+3*4", 14],
    ["=-(2+3)/2", -2.5],
  ])("calculates %s", (formula, result) =>
    expect(evaluateFormula(formula, cells)).toBe(result),
  );
  it.each([
    "=IF(1,2,3)",
    "=fetch(1)",
    "=A9",
    "=1/0",
    "=SUM(B2:A1)",
    "=2**3",
    "=globalThis.alert(1)",
  ])("rejects unsupported or unsafe formula %s", (formula) =>
    expect(() => evaluateFormula(formula, cells)).toThrow(),
  );
  it("detects circular references", () =>
    expect(() => evaluateCell("A1", { A1: "=A2", A2: "=A1" })).toThrow("循环"));
});
