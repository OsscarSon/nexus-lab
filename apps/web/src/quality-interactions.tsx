import { useState } from "react";
import {
  binaryValue,
  move,
  parseTeachingHTML,
  samplePoints,
} from "../../../packages/curriculum/quality-models";
import { checkQualityInteraction } from "../../../packages/curriculum/quality-evidence";
import type { Interaction } from "../../../packages/curriculum/schema";
type Kind = "motion" | "binary" | "markup" | "sampling";
export function QualityInteraction({
  block,
  onEvidence,
}: {
  block: Extract<Interaction, { kind: Kind }>;
  onEvidence: (value: unknown) => void;
}) {
  const [moves, setMoves] = useState<number[]>([]),
    [speed, setSpeed] = useState(1);
  const [bits, setBits] = useState([false, false, false, false]),
    [attempts, setAttempts] = useState<number[]>([]);
  const [html, setHTML] = useState("<h1>我的活动</h1>\n<p>欢迎参加</p>");
  const [rate, setRate] = useState(3),
    [rates, setRates] = useState([3]);
  const [message, setMessage] = useState("");
  const x = moves.reduce((x, s) => move(x, s), 0);
  const coin = x >= 6;
  const parsed = parseTeachingHTML(html);
  function edit() {
    setMessage("");
    onEvidence(undefined);
  }
  function check(value: unknown) {
    const passed = checkQualityInteraction(block.kind, value);
    setMessage(
      passed
        ? "练习检查通过：已验证本课独立挑战。"
        : "还需调整：" +
            {
              motion: "用速度 2 或 3 经过金币，再走到 x=10 的墙。",
              binary: "先用位权表示 10，再独立表示 5，并分别检查。",
              markup:
                '需要各一个非空 h1、p、button type="button"；不支持脚本、属性和嵌套。',
              sampling: "比较 3、4、8 Hz，最终选择严格高于两倍频率的 8 Hz。",
            }[block.kind],
    );
    onEvidence(passed ? value : undefined);
  }
  return (
    <div className="example-card quality-exercise" data-exercise={block.id}>
      <p className="eyebrow">本机教学模拟 · 可操作，非外部服务</p>
      {block.kind === "motion" && (
        <>
          <p>
            每按一次向右，位置增加步长。角色视为点；经过 x=6 收集金币，到 x=10
            停在墙边。独立挑战使用速度 2 或 3。
          </p>
          <label>
            移动速度
            <select
              value={speed}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                edit();
              }}
            >
              {[1, 2, 3].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <div
            className="quality-track"
            aria-label={`角色位置 ${x}，金币在 6，墙在 10`}
          >
            <span className="quality-player" style={{ left: `${x * 9}%` }}>
              ●
            </span>
            {!coin && <span style={{ left: "54%" }}>◆</span>}
            <span style={{ right: 0 }}>▌</span>
          </div>
          <p aria-live="polite">
            位置 x={x} · 得分 {coin ? 1 : 0}
          </p>
          <div className="row">
            <button
              onClick={() => {
                setMoves([...moves.slice(-30), speed]);
                edit();
              }}
            >
              向右移动
            </button>
            <button
              className="secondary"
              onClick={() => {
                setMoves([]);
                edit();
              }}
            >
              重置游戏
            </button>
            <button onClick={() => check(moves)}>检查运动挑战</button>
          </div>
        </>
      )}
      {block.kind === "binary" && (
        <>
          <p>
            位权从左到右是 8、4、2、1。
            {attempts.includes(10) ? "现在独立表示 5。" : "先表示十进制 10。"}
          </p>
          <div className="row">
            {bits.map((b, i) => (
              <button
                className={b ? "" : "secondary"}
                aria-label={`位权 ${2 ** (3 - i)}`}
                aria-pressed={b}
                key={i}
                onClick={() => {
                  setBits(bits.map((v, j) => (i === j ? !v : v)));
                  edit();
                }}
              >
                {2 ** (3 - i)} 位：{b ? 1 : 0}
              </button>
            ))}
          </div>
          <p className="quality-preview">
            {bits.map((b) => (b ? 1 : 0)).join("")} ={" "}
            {bits.map((b, i) => (b ? 2 ** (3 - i) : 0)).join(" + ")} ={" "}
            {binaryValue(bits)}
          </p>
          <button
            onClick={() => {
              const values = [...attempts, binaryValue(bits)];
              setAttempts(values);
              if (!attempts.includes(10) && binaryValue(bits) === 10) {
                setMessage("第一步正确！现在请表示 5。");
              } else check(values);
            }}
          >
            检查二进制挑战
          </button>
          <button
            className="secondary"
            onClick={() => {
              setAttempts([]);
              setBits([false, false, false, false]);
              edit();
            }}
          >
            重置位权练习
          </button>
        </>
      )}
      {block.kind === "markup" && (
        <>
          <p>
            受限 HTML 练习：仅支持 h1、p 和 button
            type="button"，各一个。预览由固定组件显示文本，不执行输入
            HTML、脚本或外部资源；按钮仅演示语义。
          </p>
          <label>
            HTML 源码
            <textarea
              maxLength={1500}
              value={html}
              onChange={(e) => {
                setHTML(e.target.value);
                edit();
              }}
            />
          </label>
          <div className="quality-preview" aria-label="网页即时预览">
            {parsed.elements.map((e, i) =>
              e.tag === "h1" ? (
                <h3 key={i}>{e.text}</h3>
              ) : e.tag === "p" ? (
                <p key={i}>{e.text}</p>
              ) : (
                <button
                  type="button"
                  key={i}
                  onClick={() =>
                    setMessage("这是按钮语义演示，没有提交或保存资料。")
                  }
                >
                  {e.text}
                </button>
              ),
            )}
          </div>
          <button onClick={() => check(html)}>检查网页结构</button>
        </>
      )}
      {block.kind === "sampling" && (
        <>
          <label>
            每秒采样次数
            <select
              value={rate}
              onChange={(e) => {
                const n = Number(e.target.value);
                setRate(n);
                setRates([...rates, n]);
                edit();
              }}
            >
              {[3, 4, 8, 16].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <svg
            className="quality-sampling"
            viewBox="0 0 320 150"
            role="img"
            aria-label="一秒内的 2 Hz 理想正弦波与采样点"
          >
            <path
              d={samplePoints(128)
                .map(
                  (p, i) =>
                    `${i ? "L" : "M"}${10 + p.x * 300},${75 - p.y * 55}`,
                )
                .join(" ")}
              fill="none"
              stroke="#879e95"
              strokeWidth="2"
            />
            {samplePoints(rate).map((p, i) => (
              <circle
                key={i}
                cx={10 + p.x * 300}
                cy={75 - p.y * 55}
                r="4"
                fill="#155d49"
              />
            ))}
          </svg>
          <p>
            当前 {rate} Hz ·{" "}
            {rate > 4
              ? "严格高于两倍最高频率。"
              : "未严格高于两倍频率，有混叠风险。"}{" "}
            连线表示已知原信号，不是采样数据的重建结果。
          </p>
          <button onClick={() => check(rates)}>检查采样挑战</button>
        </>
      )}
      <p role="status" className={message ? "feedback" : ""}>
        {message}
      </p>
    </div>
  );
}
