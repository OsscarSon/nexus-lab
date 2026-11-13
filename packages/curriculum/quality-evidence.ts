import { z } from "zod";
import { move, parseTeachingHTML } from "./quality-models";
export function checkQualityInteraction(kind: string, value: unknown): boolean {
  if (kind === "motion") {
    const p = z.array(z.number().int().min(1).max(3)).max(32).safeParse(value);
    if (!p.success) return false;
    let x = 0,
      fastCoin = false;
    for (const speed of p.data) {
      const next = move(x, speed);
      if (x < 6 && next >= 6 && speed >= 2) fastCoin = true;
      x = next;
    }
    return x === 10 && fastCoin;
  }
  if (kind === "binary") {
    const p = z
      .array(z.number().int().min(0).max(15))
      .max(100)
      .safeParse(value);
    return p.success && p.data.slice(0, -1).includes(10) && p.data.at(-1) === 5;
  }
  if (kind === "markup")
    return (
      typeof value === "string" &&
      value.length <= 1500 &&
      parseTeachingHTML(value).valid
    );
  if (kind === "sampling") {
    const p = z.array(z.number().int()).max(100).safeParse(value);
    return (
      p.success &&
      [3, 4, 8].every((n) => p.data.includes(n)) &&
      p.data.at(-1) === 8
    );
  }
  return false;
}
