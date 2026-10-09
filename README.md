# 🧠 CodeTutor

> **Understand code, not just run it.**

CodeTutor is an AI-powered web app that helps students genuinely understand code — not just copy-paste it. Paste any public GitHub repository URL, pick a file, and instantly get:

- 📖 **Line-by-line explanations** in plain English
- 📝 **Study notes** formatted for revision  
- 🧪 **Interactive quizzes** that test real understanding, with scored results and per-question feedback

---

## ✨ Features

- 🔍 Browse any public GitHub repo's file tree
- 🤖 AI explains every line in beginner-friendly language
- 📋 Auto-generated Markdown study notes
- 🎯 5-question multiple choice quiz per file
- 💾 Quiz scores saved locally with SQLite
- ⚡ Fast, clean single-page UI

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | SQLite (sql.js) |
| AI | Gemini (via OpenAI-compatible endpoint) with automatic model fallback |

## 🛟 Model fallback

The server uses a fallback chain of free Gemini models — if one is rate-limited, down, or retired, the next one is tried automatically (with a hard 45s per-model timeout). Defaults:

1. `gemini-3.8-flash`
2. `gemini-flash-latest`
3. `gemini-3.5-flash`
4. `gemini-3.5-flash-lite`
5. `gemini-flash-lite-latest`

Override via the `AI_MODELS` env var (comma-separated). Single `AI_MODEL` is also supported for back-compat and is prepended to the chain. Each response includes the name of the model that actually answered.

## 🚀 Deploy to Vercel

The repo ships with `vercel.json` and is configured for a single Vercel project. Before you deploy, set these env vars in **Project Settings → Environment Variables**:

| Name | Value |
|---|---|
| `AI_API_KEY` | Your Google Gemini API key |
| `AI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai` |
| `AI_MODEL` (optional) | `gemini-3.8-flash` |
| `AI_MODELS` (optional) | Comma-separated override of the fallback chain |
| `AI_TIMEOUT_MS` (optional) | `20000` (Vercel Hobby users: `8000`) |
| `GITHUB_TOKEN` (optional) | Personal access token to raise GitHub rate limits |

**Important:** Vercel serverless functions cap at 60s on Pro and 10s on Hobby. If you're on Hobby, set `AI_TIMEOUT_MS=8000` so a single model attempt can't blow the budget. Each failed model takes the full timeout before falling through, so a long chain on Hobby will hit the function cap.

## 🧪 Run locally

In one terminal:

```bash
cd server
npm install
npm run dev
```

In another:

```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:5173`. The Vite dev server proxies `/api/*` to the Express backend on port 8787.

## 🚀 Live Demo

Coming soon.

## 📄 License

MIT