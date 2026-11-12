import { STATIC_DEPLOYMENT } from "./deployment";
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  if (STATIC_DEPLOYMENT)
    throw new ApiError(503, "GitHub Pages 静态版不提供后端服务");
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Nexus-Client": "web" },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new ApiError(response.status, result.error || "请求失败，请稍后重试");
  return result as T;
}
