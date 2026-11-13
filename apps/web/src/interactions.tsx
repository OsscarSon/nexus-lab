import { QualityInteraction } from "./quality-interactions";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Interaction } from "../../../packages/curriculum/schema";
import { checkInteraction } from "../../../packages/curriculum/evidence";
import { curriculum } from "../../../content/curriculum";
import { repositoryDemo } from "../../../content/repository-demo";
import { gateOutput } from "../../../packages/lab-contracts";
import { evaluateFormula } from "../../../packages/formulas";
import { readCurriculumProgress } from "./curriculum-storage";
export function InteractiveBlock({
  block,
  onEvidence,
}: {
  block: Interaction;
  onEvidence: (value: unknown) => void;
}) {
  const [value, setValue] = useState<unknown>();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("README.md");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [moves, setMoves] = useState<("collect" | "reset")[]>([]);
  const [predictions, setPredictions] = useState<(boolean | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [selections, setSelections] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(
    block.kind === "sensor" ? block.temperature : 0,
  );
  const [a, setA] = useState(false),
    [b, setB] = useState(false);
  function check(payload: unknown) {
    const result = checkInteraction(block, payload, curriculum);
    setMessage(result.feedback);
    onEvidence(result.passed ? payload : undefined);
  }
  function edit(payload: unknown) {
    setValue(payload);
    setMessage("");
    onEvidence(undefined);
  }
  if (
    block.kind === "motion" ||
    block.kind === "binary" ||
    block.kind === "markup" ||
    block.kind === "sampling"
  )
    return <QualityInteraction block={block} onEvidence={onEvidence} />;
  if (block.kind === "repository")
    return (
      <div className="example-card">
        <h3>仓库探索 · 离线教学示例</h3>
        <p>点击文件，区分使用说明、源代码与许可。</p>
        <div className="row">
          {Object.keys(repositoryDemo).map((f) => (
            <button
              className="secondary"
              key={f}
              aria-pressed={file === f}
              onClick={() => setFile(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <pre>{repositoryDemo[file]}</pre>
        <p>此示例不连接 GitHub，也不运行代码。</p>
      </div>
    );
  let content;
  switch (block.kind) {
    case "numeric":
      content = (
        <>
          <p>{block.label}</p>
          <pre>
            {block.left} {block.operator} {block.right}
          </pre>
          <label>
            你预测的数值
            <input
              type="number"
              value={value === undefined ? "" : String(value)}
              onChange={(e) =>
                edit(e.target.value === "" ? undefined : Number(e.target.value))
              }
            />
          </label>
          <button onClick={() => check(value)}>检查练习</button>
        </>
      );
      break;
    case "prompt":
      content = (
        <>
          <p>
            为{block.audience}设计一条“{block.task}”任务，限制为
            {block.constraint}。这里做结构量规检查，不调用或模拟生成式 AI。
          </p>
          {[
            ["goal", "任务目标"],
            ["audience", "目标读者"],
            ["constraint", "输出约束"],
          ].map(([id, label]) => (
            <label key={id}>
              {label}
              <input
                value={fields[id] || ""}
                onChange={(e) => {
                  setFields({ ...fields, [id]: e.target.value });
                  setMessage("");
                  onEvidence(undefined);
                }}
              />
            </label>
          ))}
          <pre>
            {[
              fields.goal,
              fields.audience && "面向：" + fields.audience,
              fields.constraint && "要求：" + fields.constraint,
            ]
              .filter(Boolean)
              .join("\n") || "填写三个字段，查看你组合的提示。"}
          </pre>
          <button onClick={() => check(fields)}>检查提示结构</button>
        </>
      );
      break;
    case "game": {
      const score = moves.reduce(
        (score, m) => (m === "reset" ? 0 : score + 1),
        0,
      );
      content = (
        <>
          <p>
            点击收集，让分数达到 {block.target}
            。这是本地可操作的规则模型，不是完整游戏引擎。
          </p>
          <div className="game-stage">
            <strong aria-live="polite">分数：{score}</strong>
            <button
              onClick={() => {
                setMoves([...moves.slice(-30), "collect"]);
                setMessage("");
                onEvidence(undefined);
              }}
            >
              收集一颗星
            </button>
            <button
              className="secondary"
              onClick={() => {
                setMoves([]);
                onEvidence(undefined);
                setMessage("");
              }}
            >
              重置分数
            </button>
          </div>
          <button onClick={() => check(moves)}>检查胜利条件</button>
        </>
      );
      break;
    }
    case "logic":
      content = (
        <>
          <p>先观察 {block.gate}，再预测四行输出。计算使用已有逻辑门函数。</p>
          <div className="row">
            <button
              className="secondary"
              aria-pressed={a}
              onClick={() => setA(!a)}
            >
              示例 A：{Number(a)}
            </button>
            <button
              className="secondary"
              aria-pressed={b}
              onClick={() => setB(!b)}
            >
              示例 B：{Number(b)}
            </button>
            <span aria-live="polite">
              示例输出：{Number(gateOutput(block.gate, a, b))}
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>预测</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((v, i) => (
                <tr key={i}>
                  <td>{Number(Boolean(i & 2))}</td>
                  <td>{i % 2}</td>
                  <td>
                    <label>
                      <span className="sr-only">练习第 {i + 1} 行</span>
                      <select
                        value={v === null ? "" : String(Number(v))}
                        onChange={(e) => {
                          setPredictions(
                            predictions.map((p, j) =>
                              j === i ? e.target.value === "1" : p,
                            ),
                          );
                          setMessage("");
                          onEvidence(undefined);
                        }}
                      >
                        <option disabled value="">
                          请选择
                        </option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                      </select>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => check(predictions)}>检查真值表</button>
          <Link
            className="text-link"
            to="/lab/logic"
            target="_blank"
            rel="noreferrer"
          >
            打开完整逻辑门实验 ↗
          </Link>
        </>
      );
      break;
    case "request":
      content = (
        <>
          <p>
            为 {block.path} 构造一个 {block.method}{" "}
            请求。本地报文练习不连接外部服务，不会冒充实际 API 响应。
          </p>
          <label>
            HTTP 方法
            <select
              value={fields.method || ""}
              onChange={(e) => {
                setFields({ ...fields, method: e.target.value });
                onEvidence(undefined);
                setMessage("");
              }}
            >
              <option value="" disabled>
                请选择
              </option>
              {["GET", "POST", "DELETE"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            资源路径
            <input
              value={fields.path || ""}
              onChange={(e) => {
                setFields({ ...fields, path: e.target.value });
                onEvidence(undefined);
                setMessage("");
              }}
            />
          </label>
          <pre>
            {fields.method || "METHOD"} {fields.path || "/resource"} HTTP/1.1
          </pre>
          <button onClick={() => check(fields)}>检查请求报文</button>
        </>
      );
      break;
    case "permissions":
      content = (
        <>
          <p>
            只读取设备数据，选择必需的最小权限。此练习不会更改真实账户权限。
          </p>
          {block.options.map((o) => (
            <label className="permission-option" key={o}>
              <input
                type="checkbox"
                checked={selections.includes(o)}
                onChange={() => {
                  setSelections(
                    selections.includes(o)
                      ? selections.filter((v) => v !== o)
                      : [...selections, o],
                  );
                  setMessage("");
                  onEvidence(undefined);
                }}
              />
              {o}
            </label>
          ))}
          <button onClick={() => check(selections)}>检查权限选择</button>
        </>
      );
      break;
    case "sensor":
      content = (
        <>
          <p>教学控制模型：温度达到阈值时开风扇。不是硬件执行。</p>
          <label>
            观察温度：{temperature}°C
            <input
              type="range"
              min="0"
              max="50"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </label>
          <p aria-live="polite">
            阈值 {block.threshold}°C · 风扇
            {temperature >= block.threshold ? "开启" : "关闭"}
          </p>
          <fieldset className="answers">
            <legend>挑战：温度 {block.temperature}°C 时风扇应该怎样？</legend>
            {[
              [true, "开启"],
              [false, "关闭"],
            ].map(([v, label]) => (
              <label key={String(v)}>
                <input
                  type="radio"
                  name={block.id}
                  checked={value === v}
                  onChange={() => edit(v)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button onClick={() => check(value)}>检查控制预测</button>
        </>
      );
      break;
    case "classification":
      content = (
        <>
          <p>{block.instructions}</p>
          {block.claims.map((claim, i) => (
            <label key={claim.text}>
              {claim.text}
              <select
                value={selections[i] || ""}
                onChange={(e) => {
                  setSelections(
                    Array.from({ length: block.claims.length }, (_, j) =>
                      j === i ? e.target.value : selections[j] || "",
                    ),
                  );
                  setMessage("");
                  onEvidence(undefined);
                }}
              >
                <option value="" disabled>
                  请选择分类
                </option>
                {block.categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          ))}
          <button onClick={() => check(selections)}>检查分类</button>
        </>
      );
      break;
    case "formula": {
      let output = "";
      if (typeof value === "string") {
        try {
          output = String(
            evaluateFormula(value, {
              B2: fields.b2 ?? "12",
              B3: fields.b3 ?? "18",
            }),
          );
        } catch (e) {
          output = e instanceof Error ? e.message : "计算失败";
        }
      }
      content = (
        <>
          <p>{block.description}</p>
          <p>
            修改输入，观察公式如何更新。使用已有公式解释器；支持
            SUM、引用和基础运算，不是完整 Excel。
          </p>
          {[
            ["b2", "B2 材料费", "12"],
            ["b3", "B3 场地费", "18"],
          ].map(([id, label, initial]) => (
            <label key={id}>
              {label}
              <input
                value={fields[id] ?? initial}
                maxLength={30}
                onChange={(e) => {
                  setFields({ ...fields, [id]: e.target.value });
                  setMessage("");
                  onEvidence(undefined);
                }}
              />
            </label>
          ))}
          <label>
            预算公式
            <input
              value={typeof value === "string" ? value : ""}
              onChange={(e) => edit(e.target.value)}
              placeholder="=SUM(B2:B3)"
            />
          </label>
          <pre aria-live="polite">实际计算：{output || "尚未输入公式"}</pre>
          <button onClick={() => check(value)}>检查预算公式</button>
          <Link
            className="text-link"
            to="/lab/spreadsheet"
            target="_blank"
            rel="noreferrer"
          >
            打开完整公式实验 ↗
          </Link>
        </>
      );
      break;
    }
    case "lab-evidence": {
      const lab = curriculum.get("lab", block.labRef.id)!;
      content = (
        <>
          <p>
            在真实的现有实验中完成“{lab.title}
            ”，返回本页验证保存的证据。不把点击打开实验算作完成。
          </p>
          <Link
            className="button secondary"
            to={lab.route + (lab.sampleId ? "?sample=" + lab.sampleId : "")}
            target="_blank"
            rel="noreferrer"
          >
            打开{lab.runtime === "python" ? "真实 Python" : "Git 模拟"}实验 ↗
          </Link>
          <button
            onClick={() => {
              const e = readCurriculumProgress().evidence.find(
                (e) =>
                  e.kind === "lab" &&
                  e.id === lab.id &&
                  e.version === lab.version,
              );
              setValue(e?.proof);
              check(e?.proof);
            }}
          >
            验证已保存实验
          </button>
          {value !== null &&
            typeof value === "object" &&
            "output" in value &&
            typeof value.output === "string" && (
              <pre aria-label="已保存的实验输出">{value.output}</pre>
            )}
          <p className="fine">
            需要在同一浏览器/来源保存通过记录。已有兼容记录也可抵扣本练习；仍需完成本课检查题。
          </p>
        </>
      );
      break;
    }
  }
  return (
    <div className="interactive-exercise" data-exercise={block.id}>
      {content}
      {message && (
        <p className="feedback" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
