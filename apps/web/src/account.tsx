import { STATIC_DEPLOYMENT, STATIC_NOTICE } from "./deployment";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import { compatibleProgress as getProgress } from "./curriculum-storage";
import { read } from "./storage";
import { academies } from "../../../content/catalog";
import { type Ledger } from "../../../packages/curriculum/evidence";
import {
  readCurriculumProgress,
  mergeRemoteProgress,
} from "./curriculum-storage";
import { legacyLessonIds } from "../../../content/curriculum";
type User = { id: string; username: string };
export function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(
    getProgress().completed.filter((id) => legacyLessonIds.includes(id)).length,
  );
  useEffect(() => {
    if (STATIC_DEPLOYMENT) {
      setLoading(false);
      return;
    }
    api<{ user: User | null }>("/api/auth/session")
      .then((r) => setUser(r.user))
      .catch(() => setMessage("账户服务暂不可用，本地课程与实验仍可使用。"))
      .finally(() => setLoading(false));
  }, []);
  async function auth(action: "login" | "register") {
    setBusy(true);
    try {
      const result = await api<{ user: User }>("/api/auth/" + action, "POST", {
        username,
        password,
      });
      setUser(result.user);
      setPassword("");
      setMessage("已登录。点击同步，把本机课程进度与账户合并。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "请求失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="prose">
      <h1>我的学习空间</h1>
      <div className="card">
        <h2>{user ? "你好，" + user.username : "本地学习者"}</h2>
        <p>
          无需账户即可学习。本机偏好与学习记录保存在当前浏览器，清除浏览器数据会删除记录。
        </p>
        <p>已完成 {getProgress().completed.length} 个共享课时</p>
        {completed > 0 && <p>已完成 {completed} / 6 节开源课程</p>}
        <p>
          当前方向：
          {academies.find((a) => a.id === read("nexus-goal", ""))?.title ||
            "自由探索"}
        </p>
        <Link to="/welcome">重新选择方向 →</Link>
      </div>
      {STATIC_DEPLOYMENT ? (
        <div className="card">
          <h2>本机学习模式</h2>
          <p>{STATIC_NOTICE}</p>
          <p>
            账户功能需要单独部署后端；此处不会向不存在的 API
            发送请求，也不会更改已有本机记录。
          </p>
        </div>
      ) : loading ? (
        <p role="status">正在读取账户…</p>
      ) : user ? (
        <div className="card">
          <h2>账户与课程同步</h2>
          <p>
            同步会合并本机与账户中的课程完成记录，不会删除已完成课程。共用设备时，请留意本机记录属于谁。实验成果仍仅保存在本机。
          </p>
          <div className="row">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const remote = await api<{ progress: Ledger }>(
                    "/api/progress/v2",
                    "POST",
                    readCurriculumProgress(),
                  );
                  const saved = mergeRemoteProgress(remote.progress);
                  setCompleted(
                    getProgress().completed.filter((id) =>
                      legacyLessonIds.includes(id),
                    ).length,
                  );
                  setMessage(
                    saved
                      ? "同步成功，课程进度已合并。"
                      : "已同步到服务器，但本机存储不可用。",
                  );
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : "同步失败");
                } finally {
                  setBusy(false);
                }
              }}
            >
              同步课程进度
            </button>
            <button
              className="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api("/api/auth/logout", "POST", {});
                  setUser(null);
                  setMessage("已退出。当前浏览器的本地学习记录仍然保留。");
                } catch {
                  setMessage("退出失败，请重试。");
                } finally {
                  setBusy(false);
                }
              }}
            >
              退出登录
            </button>
          </div>
          <button
            className="secondary"
            disabled={busy}
            onClick={async () => {
              if (
                !window.confirm(
                  "删除账户与服务器学习进度？本机记录将保留。费用计量记录会匿名保留。",
                )
              )
                return;
              setBusy(true);
              try {
                await api("/api/account", "DELETE", {});
                setUser(null);
                setMessage("账户与同步进度已删除，匿名费用计量记录保留。");
              } catch {
                setMessage("删除失败，请重试。");
              } finally {
                setBusy(false);
              }
            }}
          >
            删除账户
          </button>
        </div>
      ) : (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            void auth("login");
          }}
        >
          <h2>可选账户，让进度随行。</h2>
          <p>
            注册仅需用户名与密码，不需要邮箱或 API
            key。本地部署使用此服务器的数据库，不代表已部署云账户服务。
          </p>
          <label>
            用户名
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              pattern="[a-zA-Z0-9_-]{3,32}"
              required
              minLength={3}
              maxLength={32}
            />
          </label>
          <label>
            密码（至少 12 个字符）
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={12}
              maxLength={128}
            />
          </label>
          <div className="row">
            <button disabled={busy} type="submit">
              登录
            </button>
            <button
              className="secondary"
              disabled={busy || username.length < 3 || password.length < 12}
              type="button"
              onClick={() => void auth("register")}
            >
              创建账户
            </button>
          </div>
        </form>
      )}
      <p role="status" className={message ? "feedback" : ""}>
        {message}
      </p>
      <Link to="/settings/ai">AI 状态与使用额度 →</Link>
    </section>
  );
}
export function AISettings() {
  const [data, setData] = useState<{
    enabled: boolean;
    signedIn: boolean;
    usage: { dailyTokens: number; userMonthlyMicroUsd: number } | null;
    limits: { dailyTokens: number; userMonthlyMicroUsd: number };
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (STATIC_DEPLOYMENT) return;
    api<NonNullable<typeof data>>("/api/mentor/usage")
      .then(setData)
      .catch(() => setError("暂时无法读取 AI 状态。课程引导仍可使用。"));
  }, []);
  return (
    <section className="prose">
      <Link to="/me">← 我的空间</Link>
      <h1>透明的帮助，安心地学习。</h1>
      <div className="card">
        <h2>学习助手</h2>
        {STATIC_DEPLOYMENT ? (
          <p>{STATIC_NOTICE} 此处不展示服务器额度，也不提供密钥输入。</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : !data ? (
          <p role="status">正在读取平台状态…</p>
        ) : (
          <>
            <p>
              生成式 AI：
              {data.enabled
                ? "平台已配置（实际调用可能仍受额度或服务状态限制）"
                : "未启用，提供非生成式课程引导"}
            </p>
            <p>
              账户：{data.signedIn ? "已登录" : "未登录 · 基础课程无需登录"}
            </p>
            {data.usage && (
              <>
                <label>
                  今日 token 用量{" "}
                  <progress
                    max={data.limits.dailyTokens}
                    value={data.usage.dailyTokens}
                  />
                </label>
                <p>
                  {data.usage.dailyTokens} / {data.limits.dailyTokens} tokens
                </p>
                <p>
                  本月账户预算：$
                  {(data.usage.userMonthlyMicroUsd / 1000000).toFixed(4)} / $
                  {(data.limits.userMonthlyMicroUsd / 1000000).toFixed(2)}
                </p>
              </>
            )}
          </>
        )}
        <p>
          额度与预算用尽时自动切换课程引导。AI
          生成的文字不会自动执行代码。平台凭据仅由服务器读取，学习者不需要自己的密钥。
        </p>
        <p>BYOK 与本地模型尚未开放。此版本不接收或存储用户提供的 API key。</p>
      </div>
    </section>
  );
}
