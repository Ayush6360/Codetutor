import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
});

const MODEL = process.env.AI_MODEL || "gemini-2.5-flash";

export async function chat(messages, { json = false } = {}) {
  const params = {
    model: MODEL,
    max_tokens: 8192,
    messages,
  };

  if (json) {
    const last = messages[messages.length - 1];
    params.messages = [
      ...messages.slice(0, -1),
      {
        ...last,
        content:
          last.content +
          "\n\nCRITICAL: You must respond with valid JSON only. No markdown fences, no backticks, no explanation. Just the raw JSON object starting with { and ending with }.",
      },
    ];
  }

  const completion = await client.chat.completions.create(params);
  const text = completion.choices[0].message.content;

  if (json) {
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(clean);
  }

  return text;
}