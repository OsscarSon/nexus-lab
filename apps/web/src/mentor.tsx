import { useState } from "react";
import { Link } from "react-router-dom";
import { fallback } from "../../../packages/ai-gateway/fallback";
import type {
  MentorRequest,
  MentorResponse,
} from "../../../packages/ai-gateway/contracts";
import { ApiError, api } from "./api";
const modes = [
  ["explain", "解释 Explain"],
  ["hint", "提示 Hint"],
  ["debug", "排错 Debug"],
  ["build", "实践 Build"],
] as const;
const reasons: Record<string, string> = {
  "ai-disabled": "平台 AI 尚未启用",
  "sign-in-required": "生成式 AI 需要先登录",
  "daily-token-limit": "今日额度已用完",
  "account-budget-limit": "账户预算已达上限",
  "platform-budget-limit": "平台预算已达上限",
  "rate-limit": "请求过于频繁",
  "concurrency-limit": "导师繁忙，请稍后重试",
  "provider-unavailable": "AI 服务暂不可用",
  "provider-metering-unavailable": "AI 计量无法验证，已停止生成式调用",
  offline: "网络或服务不可用",
};
export function Mentor({ lessonId }: { lessonId?: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MentorRequest["mode"]>("explain");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<MentorResponse | null>(null);
  return (
    <section className="mentor">
      <button
        className="secondary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mentor-content"
      >
        {open ? "收起学习助手" : "需要帮助？打开学习助手"} ✧
      </button>
      {open && (
        <div id="mentor-content" className="card">
          <h2>学习助手 · Mentor</h2>
          <p>
            默认提供课程引导，明确标注非生成式内容。平台 AI
            仅在启用并登录后可用，不需要你的 API key。问题将发送至平台后端；启用
            AI 时会发送给配置的服务商，请勿输入私人信息或密钥。
          </p>
          <label>
            教学模式
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as MentorRequest["mode"])}
            >
              {modes.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            你的问题
            <textarea
              value={message}
              maxLength={2000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="哪里让你困惑？"
            />
          </label>
          <div className="row">
            <button
              disabled={busy || !message.trim()}
              onClick={async () => {
                setBusy(true);
                const request = { mode, lessonId, userMessage: message };
                try {
                  setResponse(
                    await api<MentorResponse>(
                      "/api/mentor/chat",
                      "POST",
                      request,
                    ),
                  );
                } catch (error) {
                  setResponse(
                    fallback(
                      request,
                      error instanceof ApiError && error.status === 429
                        ? "rate-limit"
                        : "offline",
                    ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "正在请求…" : "获取帮助"}
            </button>
            <Link to="/settings/ai">查看额度与 AI 设置 →</Link>
          </div>
          {response && (
            <div role="status" className="feedback">
              <strong>
                {response.providerKind === "platform"
                  ? "AI 生成 · 未执行代码"
                  : "课程引导 · 非生成式内容"}
              </strong>
              {response.reason && (
                <p>
                  {reasons[response.reason] || "AI 当前不可用"}
                  。以下是预先编写的教学材料，不是对问题的 AI 回答。
                </p>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{response.answer}</p>
              {response.quotaRemaining !== undefined && (
                <p>今日剩余额度：{response.quotaRemaining} tokens</p>
              )}
              {response.references.map((r) => (
                <p key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title} ↗
                  </a>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
