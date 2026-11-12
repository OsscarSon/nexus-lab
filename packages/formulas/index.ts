export type Cells = Record<string, string>;
export class FormulaError extends Error {}
export function evaluateCell(
  id: string,
  cells: Cells,
  visited: string[] = [],
): number {
  if (visited.includes(id)) throw new FormulaError("循环引用");
  if (visited.length > 32) throw new FormulaError("引用层级过深");
  if (!Object.hasOwn(cells, id)) throw new FormulaError("未知单元格：" + id);
  const raw = cells[id].trim();
  if (!raw.startsWith("=")) {
    if (!raw || !Number.isFinite(Number(raw)))
      throw new FormulaError("单元格不是数值：" + id);
    return Number(raw);
  }
  return evaluateFormula(raw, cells, [...visited, id]);
}
export function evaluateFormula(
  formula: string,
  cells: Cells,
  visited: string[] = [],
): number {
  if (formula.length > 300) throw new FormulaError("公式过长");
  if (!formula.startsWith("=")) throw new FormulaError("公式必须以 = 开头");
  const input = formula.slice(1).toUpperCase();
  const tokens =
    input.match(/[A-Z]+[0-9]+|[A-Z]+|\d+(?:\.\d+)?|[()+\-*/,:]/g) || [];
  if (tokens.join("") !== input.replace(/\s/g, ""))
    throw new FormulaError("不支持的字符或语法");
  let index = 0,
    depth = 0;
  const peek = () => tokens[index];
  function take(expected?: string) {
    const token = tokens[index++];
    if (!token || (expected && token !== expected))
      throw new FormulaError("公式语法错误");
    return token;
  }
  function primary(): number {
    if (++depth > 32) throw new FormulaError("表达式嵌套过深");
    let value: number;
    const token = take();
    if (token === "+" || token === "-") {
      value = primary() * (token === "-" ? -1 : 1);
    } else if (token === "(") {
      value = expression();
      take(")");
    } else if (/^\d/.test(token)) {
      value = Number(token);
    } else if (/^[A-Z]+\d+$/.test(token)) {
      value = evaluateCell(token, cells, visited);
    } else if (["SUM", "AVERAGE", "MIN", "MAX"].includes(token)) {
      take("(");
      const values: number[] = [];
      do {
        if (peek() === ",") take(",");
        if (/^[A-Z]+\d+$/.test(peek() || "") && tokens[index + 1] === ":") {
          const start = take();
          take(":");
          const end = take();
          const a = /^([A-Z])(\d+)$/.exec(start),
            b = /^([A-Z])(\d+)$/.exec(end);
          if (
            !a ||
            !b ||
            a[1] !== b[1] ||
            Number(b[2]) < Number(a[2]) ||
            Number(b[2]) - Number(a[2]) > 100
          )
            throw new FormulaError("仅支持同列、顺序范围");
          for (let r = Number(a[2]); r <= Number(b[2]); r++)
            values.push(evaluateCell(a[1] + r, cells, visited));
        } else values.push(expression());
      } while (peek() === ",");
      take(")");
      value =
        token === "SUM"
          ? values.reduce((a, b) => a + b, 0)
          : token === "AVERAGE"
            ? values.reduce((a, b) => a + b, 0) / values.length
            : token === "MIN"
              ? Math.min(...values)
              : Math.max(...values);
    } else throw new FormulaError("不支持的函数或引用：" + token);
    depth--;
    return value;
  }
  function product(): number {
    let v = primary();
    while (peek() === "*" || peek() === "/") {
      const op = take(),
        r = primary();
      if (op === "/" && r === 0) throw new FormulaError("除数不能为零");
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function expression(): number {
    let v = product();
    while (peek() === "+" || peek() === "-") {
      const op = take(),
        r = product();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  const result = expression();
  if (index !== tokens.length) throw new FormulaError("存在多余符号");
  if (!Number.isFinite(result)) throw new FormulaError("结果不是有限数值");
  return result;
}
