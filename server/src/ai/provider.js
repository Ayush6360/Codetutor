import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
});

const MODEL = process.env.AI_MODEL || "claude-haiku-4-5-20251001";

export async function chat(messages, { json = false } = {}) {
  const params = {
    model: MODEL,
    max_tokens: 4096,
    messages,
  };

  // For JSON responses, instruct the model via the system prompt instead
  if (json) {
    const last = messages[messages.length - 1];
    params.messages = [
      ...messages.slice(0, -1),
      {
        ...last,
        content: last.content + "\n\nYou must respond with valid JSON only. No explanation, no markdown fences, just the raw JSON object.",
      },
    ];
  }

  const completion = await client.chat.completions.create(params);
  const text = completion.choices[0].message.content;

  if (json) {
    const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  }

  return text;
}