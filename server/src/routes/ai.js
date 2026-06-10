import { Router } from "express";
import { chat } from "../ai/provider.js";
import { saveAnalysis, saveQuizResult } from "../db/database.js";

const router = Router();

// Helper: add line numbers to code for the prompt
function withLineNumbers(code) {
  return code
    .split("\n")
    .map((line, i) => `${String(i + 1).padStart(4, " ")} | ${line}`)
    .join("\n");
}

// ── POST /api/ai/explain ─────────────────────────────────────────────────────
router.post("/explain", async (req, res) => {
  const { repo, path, code } = req.body;
  if (!code) return res.status(400).json({ error: "code is required." });

  try {
    const numbered = withLineNumbers(code);
    const explanation = await chat([
      {
        role: "system",
        content: `You are a patient programming tutor. Explain code to a student who is learning to code.
Be clear, friendly, and use plain English. Avoid jargon unless you define it.`,
      },
      {
        role: "user",
        content: `Please explain the following code file line by line. 
For each meaningful line or logical block, describe:
1. What it does
2. Why it matters or how it connects to the rest

Here is the code with line numbers:
\`\`\`
${numbered}
\`\`\`

Format your response as a clear explanation, referencing line numbers (e.g. "Line 3:", "Lines 5-8:").
Skip blank lines and comment-only lines unless they're important.`,
      },
    ]);

    // Save to database
    if (repo && path) {
      await saveAnalysis(repo, path, "explain", explanation);
    }

    return res.json({ explanation });
  } catch (err) {
    console.error("AI /explain error:", err.message);
    return res.status(500).json({ error: "AI request failed: " + err.message });
  }
});

// ── POST /api/ai/notes ───────────────────────────────────────────────────────
router.post("/notes", async (req, res) => {
  const { repo, path, code } = req.body;
  if (!code) return res.status(400).json({ error: "code is required." });

  try {
    const notes = await chat([
      {
        role: "system",
        content: `You are a study notes generator. Create concise, well-structured Markdown notes 
that a student can use to revise and remember the key concepts in a code file.`,
      },
      {
        role: "user",
        content: `Create concise study notes for the following code file.

Include:
- **Purpose**: What this file/module does overall
- **Key Concepts**: Important programming concepts used (with brief definitions)
- **How It Works**: A short numbered walkthrough of the main logic
- **Things to Remember**: 3-5 bullet points of the most important takeaways

Code:
\`\`\`
${code}
\`\`\`

Format everything in clean Markdown with headers, bold text, and bullet points.`,
      },
    ]);

    if (repo && path) {
      await saveAnalysis(repo, path, "notes", notes);
    }

    return res.json({ notes });
  } catch (err) {
    console.error("AI /notes error:", err.message);
    return res.status(500).json({ error: "AI request failed: " + err.message });
  }
});

// ── POST /api/ai/quiz ────────────────────────────────────────────────────────
router.post("/quiz", async (req, res) => {
  const { path, code } = req.body;
  if (!code) return res.status(400).json({ error: "code is required." });

  try {
    const result = await chat(
      [
        {
          role: "system",
          content: `You are a programming quiz generator. Your job is to test whether a student 
truly UNDERSTANDS code — not just memorized it. Create questions that require reasoning, not recall.
You must respond with valid JSON only, no other text.`,
        },
        {
          role: "user",
          content: `Generate a 5-question multiple choice quiz about the following code.

Rules:
- Questions must test understanding (e.g. "What would happen if...", "Why does...", "What is the purpose of...")
- Do NOT ask trivial questions like "What is on line 5?"
- Each question has exactly 4 options
- Options should be plausible — wrong answers should reflect common misunderstandings
- Include a brief explanation of why the correct answer is right

Respond with this exact JSON structure:
{
  "questions": [
    {
      "q": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "why": "Explanation of why this answer is correct"
    }
  ]
}

The "answer" field is the 0-based index of the correct option.

Code to quiz on:
\`\`\`
${code}
\`\`\``,
        },
      ],
      { json: true }
    );

    // Validate structure
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("AI returned invalid quiz structure.");
    }

    return res.json({ questions: result.questions });
  } catch (err) {
    console.error("AI /quiz error:", err.message);
    return res.status(500).json({ error: "AI request failed: " + err.message });
  }
});

// ── POST /api/ai/quiz/result ─────────────────────────────────────────────────
router.post("/quiz/result", async (req, res) => {
  const { repo, path, score, total } = req.body;
  if (score === undefined || total === undefined) {
    return res.status(400).json({ error: "score and total are required." });
  }

  try {
    await saveQuizResult(repo || "", path || "", Number(score), Number(total));
    return res.json({ ok: true });
  } catch (err) {
    console.error("DB quiz/result error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;