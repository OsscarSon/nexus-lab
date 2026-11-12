import { PageIntro, Badge, WorkspacePanels } from "./components/ui";
import { Mentor } from "./mentor";
import { Icon } from "./components/icon";
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
  const [panel, setPanel] = useState("work");
  const [report, setReport] = useState("");
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
  function check() {
    try {
      const value = evaluateFormula(formula, cells);
      const fixtures = [
        { B2: "12", B3: "18" },
        { B2: "3", B3: "8" },
        { B2: "5", B3: "0" },
      ];
      const passed = fixtures.every(
        (f) => evaluateFormula(formula, f) === Number(f.B2) + Number(f.B3),
      );
      setReport(formula + " → " + value);
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
      const message = e instanceof Error ? e.message : "计算失败";
      setFeedback("公式错误：" + message);
      setReport("公式未通过：" + message);
    }
    setPanel("result");
  }
  return (
    <div className="lab-workspace">
      <Link className="back-link" to="/lab">
        ← 所有实验
      </Link>
      <PageIntro
        eyebrow="NEXUS LAB · FORMULA WORKSPACE"
        title="让单元格，替你计算。"
      >
        从活动预算开始，用公式把想法变成可验证的结果。
      </PageIntro>
      <div className="workspace-meta">
        <Badge>本地公式计算</Badge>
        <span>有限教学子集 · 不连接外部表格</span>
      </div>
      <WorkspacePanels
        active={panel}
        onSelect={setPanel}
        variant="lab-panels"
        panels={[
          {
            id: "guide",
            label: "任务说明",
            children: (
              <div className="task-brief">
                <span className="eyebrow">YOUR CHALLENGE</span>
                <h2>任务：活动预算</h2>
                <p>
                  12 元材料费 + 18
                  元场地费。先试公式，再修改预算看结果如何变化。公式要在不同输入下正确求和，不只是写出
                  30。
                </p>
                <details>
                  <summary>支持哪些公式？</summary>
                  <p>
                    不是 Excel 或 Google Sheets。支持数字、A1 单元格引用、+ − *
                    /、括号，以及
                    SUM、AVERAGE、MIN、MAX（同列范围或逗号参数）。不支持文本、IF、跨表、日期或外部数据；不执行
                    JavaScript。
                  </p>
                </details>
              </div>
            ),
          },
          {
            id: "work",
            label: "操作区",
            children: (
              <div className="workspace-editor">
                <h2>编辑你的预算</h2>
                <div className="table-scroll">
                  <table className="spreadsheet-table">
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
                                setReport("");
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
                    className="formula-input"
                    value={formula}
                    maxLength={300}
                    onChange={(e) => {
                      setFormula(e.target.value);
                      setFeedback("");
                      setReport("");
                    }}
                  />
                </label>
                <p className="fine">例如 =SUM(B2:B3)，也可以试试 =B2+B3。</p>
              </div>
            ),
          },
          {
            id: "result",
            label: "结果",
            children: (
              <div className="workspace-output">
                <span className="eyebrow">CALCULATE & VERIFY</span>
                <h2>实际计算结果</h2>
                {report ? (
                  <pre>{report}</pre>
                ) : (
                  <div className="output-empty">
                    <Icon name="spreadsheet" size={36} />
                    <p>计算一次公式，查看结果与检查反馈。</p>
                  </div>
                )}
                <p className="fine">
                  挑战使用多组数值验证，拒绝把答案写死。修改输入后请重新计算。
                </p>
                <button
                  className="secondary mobile-panel-action"
                  onClick={() => setPanel("work")}
                >
                  返回操作区
                </button>
              </div>
            ),
          },
        ]}
      />
      <div className="workspace-actions">
        <button onClick={check}>
          <Icon name="check" size={18} />
          计算并检查
        </button>
        <button
          className="secondary"
          onClick={() => {
            setCells(initial);
            setFormula("=SUM(B2:B3)");
            setFeedback("已重置练习。");
            setReport("");
            setPanel("work");
          }}
        >
          重置练习
        </button>
      </div>
      <p role="status" className={feedback ? "feedback" : ""}>
        {feedback}
      </p>
      <Mentor />
    </div>
  );
}
