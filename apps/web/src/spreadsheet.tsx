import { useState } from "react";
import { Link } from "react-router-dom";
import {
  evaluateCell,
  evaluateFormula,
  type Cells,
} from "../../../packages/formulas";
import { write } from "./storage";
const initial: Cells = { B2: "12", B3: "18", B4: "=SUM(B2:B3)" };
export default function Spreadsheet() {
  const [cells, setCells] = useState<Cells>(initial);
  const [formula, setFormula] = useState("=SUM(B2:B3)");
  const [feedback, setFeedback] = useState("");
  function display(id: string) {
    try {
      return String(evaluateCell(id, cells));
    } catch (e) {
      return e instanceof Error ? e.message : "计算错误";
    }
  }
  return (
    <section className="prose">
      <Link to="/lab">← 所有实验</Link>
      <p className="eyebrow">FORMULA WORKSHOP · 本地公式解释器</p>
      <h1>让单元格，替你计算。</h1>
      <p>
        不是 Excel 或 Google Sheets。支持数字、A1 单元格引用、+ − *
        /、括号，以及
        SUM、AVERAGE、MIN、MAX（同列范围或逗号参数）。不支持文本、IF、跨表、日期或外部数据；不执行
        JavaScript。
      </p>
      <div className="card">
        <h2>任务：活动预算</h2>
        <p>12 元材料费 + 18 元场地费。先试公式，再修改预算看结果如何变化。</p>
        <table>
          <thead>
            <tr>
              <th>行 / 项目</th>
              <th>B · 公式或数值</th>
              <th>计算值</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["B2", "材料费"],
              ["B3", "场地费"],
              ["B4", "合计"],
            ].map(([id, label]) => (
              <tr key={id}>
                <th>
                  {id} {label}
                </th>
                <td>
                  <input
                    aria-label={id}
                    value={cells[id]}
                    maxLength={300}
                    onChange={(e) => {
                      setCells({ ...cells, [id]: e.target.value });
                      setFeedback("");
                    }}
                  />
                </td>
                <td aria-live="polite">{display(id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label>
        挑战公式：计算 B2 与 B3 的总和
        <input
          value={formula}
          maxLength={300}
          onChange={(e) => {
            setFormula(e.target.value);
            setFeedback("");
          }}
        />
      </label>
      <div className="row">
        <button
          onClick={() => {
            try {
              const value = evaluateFormula(formula, cells);
              const fixtures = [
                { B2: "12", B3: "18" },
                { B2: "3", B3: "8" },
                { B2: "5", B3: "0" },
              ];
              const passed = fixtures.every(
                (f) =>
                  evaluateFormula(formula, f) === Number(f.B2) + Number(f.B3),
              );
              setFeedback(
                `实际计算结果：${value}。` +
                  (passed
                    ? write("nexus-lab-spreadsheet", {
                        formula,
                        completedAt: new Date().toISOString(),
                      })
                      ? "挑战通过：在多组数值上正确求和，证据已保存。"
                      : "挑战通过，存储不可用未保存。"
                    : "还没通过：公式需要适用于不同的预算，不要直接写死 30。"),
              );
            } catch (e) {
              setFeedback(
                "公式错误：" + (e instanceof Error ? e.message : "计算失败"),
              );
            }
          }}
        >
          计算并检查
        </button>
        <button
          className="secondary"
          onClick={() => {
            setCells(initial);
            setFormula("=SUM(B2:B3)");
            setFeedback("已重置练习。");
          }}
        >
          重置练习
        </button>
      </div>
      <p role="status" className={feedback ? "feedback" : ""}>
        {feedback}
      </p>
    </section>
  );
}
