import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { pythonSamples } from "../../../content/python";
import { write } from "./storage";
export default function PythonLab() {
  const [sampleId, setSampleId] = useState("variables");
  const sample = pythonSamples.find((s) => s.id === sampleId)!;
  const [input, setInput] = useState("7");
  const [state, setState] = useState<
    "idle" | "loading" | "ready" | "running" | "error"
  >("idle");
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState("");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitted = useRef<{ sampleId: string; input: number } | null>(null);
  function stop(message = "已停止执行。需要重新加载 Python。") {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    setState("idle");
    setFeedback(message);
  }
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function deadline(ms: number) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => stop("超过时间限制，运行时已终止。请重新加载后再试。"),
      ms,
    );
  }
  function load() {
    if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
      setState("error");
      setFeedback(
        "此浏览器不支持 Worker 或 WebAssembly，无法运行 Python。课程仍可阅读。",
      );
      return;
    }
    setState("loading");
    setFeedback("首次加载约 12 MB，本地 WebAssembly Python，不上传输入。");
    const w = new Worker("/python-worker.js");
    worker.current = w;
    deadline(45000);
    w.onmessage = ({ data }) => {
      if (timer.current) clearTimeout(timer.current);
      if (data.type === "ready") {
        setState("ready");
        setFeedback("Python 已就绪。选择示例并运行。");
      } else if (data.type === "result") {
        setState("ready");
        setOutput(data.output);
        const attempt = submitted.current;
        const target = pythonSamples.find((s) => s.id === attempt?.sampleId);
        if (
          target &&
          attempt?.input === target.input &&
          data.output === target.expected
        ) {
          const saved = write("nexus-python-" + target.id, {
            completedAt: new Date().toISOString(),
            output: data.output,
          });
          setFeedback(
            "挑战通过：真实 Python 输出与目标一致。" +
              (saved ? "证据已保存。" : "存储不可用，未保存。"),
          );
        } else setFeedback("执行完成。试试任务指定的输入，验证预期结果。");
      } else {
        stop("Python 错误：" + data.message);
        setState("error");
      }
    };
    w.onerror = () => {
      stop("运行时加载失败，请检查网络和静态资源部署后重试。");
      setState("error");
    };
    w.postMessage({ type: "init" });
  }
  function run() {
    const n = Number(input);
    if (!/^\d{1,4}$/.test(input) || !Number.isInteger(n) || n > 1000) {
      setFeedback("请输入 0–1000 的整数。");
      return;
    }
    submitted.current = { sampleId, input: n };
    setState("running");
    setOutput("");
    setFeedback("Python 正在执行…");
    deadline(5000);
    worker.current?.postMessage({ type: "run", sampleId, input: n });
  }
  return (
    <section className="prose">
      <Link to="/lab">← 所有实验</Link>
      <p className="eyebrow">REAL PYTHON · PYODIDE 0.29.3</p>
      <h1>在浏览器，运行第一段 Python。</h1>
      <p>
        3 个微课程，使用真实 CPython/WebAssembly
        执行。为控制资源，仅运行这里的精选程序，整数输入上限
        1000；不支持安装第三方包或任意导入。
      </p>
      <label>
        课程示例
        <select
          value={sampleId}
          disabled={state === "running"}
          onChange={(e) => {
            const next = pythonSamples.find((s) => s.id === e.target.value)!;
            setSampleId(next.id);
            setInput(String(next.input));
            setOutput("");
            setFeedback("");
          }}
        >
          {pythonSamples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <h2>{sample.title}</h2>
      <p>{sample.objective}</p>
      <p>{sample.explanation}</p>
      <pre aria-label="Python 源代码">
        {sample.source.replaceAll(
          "INPUT",
          /^\d{1,4}$/.test(input) ? input : "INPUT",
        )}
      </pre>
      <label>
        整数输入
        <input
          type="number"
          min="0"
          max="1000"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={state === "running"}
        />
      </label>
      <p>
        任务输入：{sample.input} · 目标输出：{sample.expected}
      </p>
      <div className="row">
        {state === "idle" || state === "error" ? (
          <button onClick={load}>加载 Python 运行时</button>
        ) : (
          <button disabled={state !== "ready"} onClick={run}>
            {state === "loading"
              ? "正在加载…"
              : state === "running"
                ? "正在执行…"
                : "运行 Python"}
          </button>
        )}
        <button
          className="secondary"
          onClick={() => stop()}
          disabled={state === "idle"}
        >
          停止并重置运行时
        </button>
      </div>
      <p role="status" className="feedback">
        {feedback}
      </p>
      <h2>实际执行输出</h2>
      <pre aria-live="polite">{output || "尚无输出"}</pre>
    </section>
  );
}
