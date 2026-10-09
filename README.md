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

## 🚀 Live Demo

Coming soon.

## 📄 License

MIT