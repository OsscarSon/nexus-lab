import { z } from "zod";
import type { Provider } from "./contracts";
const responseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().max(16000) }) }))
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().int().nonnegative(),
      completion_tokens: z.number().int().nonnegative(),
    })
    .optional(),
});
export class OpenAICompatibleProvider implements Provider {
  constructor(
    private config: { key: string; endpoint: string; model: string },
  ) {
    const url = new URL(config.endpoint);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw Error("Provider endpoint must be a trusted HTTPS URL");
  }
  async chat(request: Parameters<Provider["chat"]>[0]) {
    const response = await fetch(this.config.endpoint, {
      method: "POST",
      redirect: "error",
      signal: request.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.config.key,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
        max_tokens: request.maxTokens,
        stream: false,
      }),
    });
    if (!response.ok) throw Error("Provider request failed");
    const reader = response.body?.getReader();
    if (!reader) throw Error("Empty provider response");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 64000) throw Error("Provider response exceeds limit");
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const parsed = responseSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (!parsed.choices[0].message.content.trim())
      throw Error("Empty provider answer");
    return {
      answer: parsed.choices[0].message.content,
      inputTokens: parsed.usage?.prompt_tokens,
      outputTokens: parsed.usage?.completion_tokens,
    };
  }
}
