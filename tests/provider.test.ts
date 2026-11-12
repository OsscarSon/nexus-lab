import { afterEach, it, expect, vi } from "vitest";
import { OpenAICompatibleProvider } from "../packages/ai-gateway/provider";
afterEach(() => vi.unstubAllGlobals());
const make = () =>
  new OpenAICompatibleProvider({
    key: "automated-test-only",
    endpoint: "https://provider.example/v1/chat/completions",
    model: "test-model",
  });
const request = {
  system: "Teaching rules",
  user: "Question",
  maxTokens: 512,
  signal: AbortSignal.timeout(1000),
};
it("validates a metered provider response and sends no execution tools", async () => {
  const mocked = vi.fn(async (_url: string, options: RequestInit) => {
    const body = JSON.parse(options.body as string);
    expect(body.max_tokens).toBe(512);
    expect(body.tools).toBeUndefined();
    expect(options.signal).toBe(request.signal);
    expect(options.redirect).toBe("error");
    return new Response(
      JSON.stringify({
        choices: [
          { message: { content: "A real-provider-shaped test response" } },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20 },
      }),
    );
  });
  vi.stubGlobal("fetch", mocked);
  const result = await make().chat(request);
  expect(result.inputTokens).toBe(50);
  expect(result.outputTokens).toBe(20);
});
it("does not expose provider error bodies", async () => {
  vi.stubGlobal(
    "fetch",
    async () => new Response("sensitive upstream details", { status: 401 }),
  );
  await expect(make().chat(request)).rejects.toThrow("Provider request failed");
});
it("bounds provider payloads and rejects malformed output", async () => {
  vi.stubGlobal("fetch", async () => new Response("x".repeat(65000)));
  await expect(make().chat(request)).rejects.toThrow("exceeds limit");
  vi.stubGlobal(
    "fetch",
    async () => new Response(JSON.stringify({ choices: [] })),
  );
  await expect(make().chat(request)).rejects.toThrow();
});
it.each([
  "http://provider.example/chat",
  "https://user:pass@provider.example/chat",
])("rejects unsafe endpoint %s", (endpoint) =>
  expect(
    () =>
      new OpenAICompatibleProvider({
        key: "test-only",
        endpoint,
        model: "test",
      }),
  ).toThrow(),
);
