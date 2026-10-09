import OpenAI from "openai";

// ── Configuration ────────────────────────────────────────────────────────────
// We try a list of free Gemini models in order. The first one that succeeds
// wins. If a model returns a retryable failure (rate limit, model unavailable,
// network timeout, etc.) we move on to the next one automatically.
//
// You can override the order with the AI_MODELS env var (comma-separated).
// Leave AI_MODELS unset to use the defaults below — the safest, most-available
// free Gemini models at the time of writing.
const DEFAULT_MODELS = [
  "gemini-3.8-flash",         // Newest free flash (most capable)
  "gemini-flash-latest",      // Alias that always resolves to current flash
  "gemini-3.5-flash",         // Stable current gen
  "gemini-3.5-flash-lite",    // Cheaper / higher quota
  "gemini-flash-lite-latest", // Alias to current lite
];

function getModelChain() {
  const seen = new Set();
  const out = [];

  // Prepend AI_MODEL for back-compat, then append the (overrideable) AI_MODELS
  // list, then the built-in defaults. Preserve order; de-dupe by exact name.
  const raw = [];
  if (process.env.AI_MODEL && process.env.AI_MODEL.trim()) {
    raw.push(process.env.AI_MODEL.trim());
  }
  if (process.env.AI_MODELS && process.env.AI_MODELS.trim()) {
    raw.push(
      ...process.env.AI_MODELS.split(",").map((m) => m.trim()).filter(Boolean)
    );
  }
  raw.push(...DEFAULT_MODELS);

  for (const m of raw) {
    if (!seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

// Errors that should trigger a fallback to the next model in the chain.
function isRetryable(err) {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  if (status === 404) return true;   // model not found / retired
  if (status === 429) return true;   // rate-limited / quota
  if (status === 503) return true;   // service unavailable
  if (status === 500) return true;   // server error
  if (status === 408) return true;   // request timeout

  const msg = String(err?.message || err || "").toLowerCase();
  if (
    msg.includes("timeout") ||
    msg.includes("etimedout") ||
    msg.includes("econnreset") ||
    msg.includes("econnaborted") ||
    msg.includes("socket hang up") ||
    msg.includes("resource_exhausted") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("model not found") ||
    msg.includes("is not found") ||
    msg.includes("no longer available")
  ) {
    return true;
  }
  return false;
}

function makeClient() {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 20_000;
  return new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL:
      process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai",
    timeout: timeoutMs, // hard cap so a hung model doesn't lock the request
  });
}

// ── Public API ───────────────────────────────────────────────────────────────
// `chat()` tries each model in the chain until one succeeds.
// Returns { text, model } on success, where `model` is the name of the model
// that actually answered.
export async function chat(messages, { json = false } = {}) {
  const chain = getModelChain();
  const client = makeClient();

  if (json) {
    const last = messages[messages.length - 1];
    messages = [
      ...messages.slice(0, -1),
      {
        ...last,
        content:
          last.content +
          "\n\nCRITICAL: You must respond with valid JSON only. No markdown fences, no backticks, no explanation. Just the raw JSON object starting with { and ending with }.",
      },
    ];
  }

  const attempts = [];
  let lastError;

  for (const model of chain) {
    try {
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 8192,
        messages,
      });

      const text = completion.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Empty response from model.");
      }

      if (json) {
        const clean = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        return { data: JSON.parse(clean), model };
      }
      return { data: text, model };
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.statusCode ?? err?.response?.status;
      attempts.push({ model, status: status || "—", message: err?.message || String(err) });

      if (isRetryable(err)) {
        // Try the next model in the chain.
        console.warn(
          `[ai] model "${model}" failed (${status || err?.message || "error"}), trying next…`
        );
        continue;
      }

      // Non-retryable: surface immediately (e.g. auth failure, bad request body).
      throw err;
    }
  }

  // All models failed. Throw a single, helpful error that lists what was tried.
  const summary = attempts
    .map((a) => `${a.model} (${a.status})`)
    .join(", ");
  const err = new Error(
    `All AI models failed. Tried: ${summary}. Last error: ${lastError?.message || "unknown"}`
  );
  err.attempts = attempts;
  err.lastError = lastError;
  throw err;
}

// Re-export for clients that want to show the configured chain in their UI.
export function getAvailableModels() {
  return getModelChain();
}
