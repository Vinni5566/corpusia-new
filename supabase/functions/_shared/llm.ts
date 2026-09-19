// Thin wrapper around an OpenAI-compatible chat completions endpoint.
// Configure via Supabase secrets:
//   supabase secrets set LLM_API_KEY=sk-...
//   supabase secrets set LLM_API_BASE=https://api.openai.com/v1   (optional, this is the default)
//   supabase secrets set LLM_MODEL=gpt-4o-mini                    (optional)
//
// Any OpenAI-compatible provider works (OpenAI, Groq, OpenRouter, etc.) as
// long as LLM_API_BASE points at its /chat/completions-compatible root.

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Hard timeout so one slow/stuck provider call can never stall an entire
// pipeline run (e.g. the 9-call Boardroom Debate). Tunable via secret:
//   supabase secrets set LLM_TIMEOUT_MS=12000
const DEFAULT_TIMEOUT_MS = 12000;

// Short, capped responses keep every call fast regardless of model — the
// UI only ever needs 1-2 sentences of dialogue or a small JSON object, so
// there's no reason to let the model generate long completions.
const DEFAULT_MAX_TOKENS = 180;

export async function callLlm(
  messages: LlmMessage[],
  jsonMode = false,
  maxTokens = DEFAULT_MAX_TOKENS,
): Promise<string> {
  const apiKey = Deno.env.get("LLM_API_KEY");
  const apiBase = Deno.env.get("LLM_API_BASE") ?? "https://api.openai.com/v1";
  const model = Deno.env.get("LLM_MODEL") ?? "gpt-4o-mini";
  const timeoutMs = Number(Deno.env.get("LLM_TIMEOUT_MS")) || DEFAULT_TIMEOUT_MS;

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY secret is not set. Run: supabase secrets set LLM_API_KEY=sk-...",
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM call failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`LLM call timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
