# 🧠 CodeTutor

**Understand code, not just run it.**

CodeTutor helps students genuinely understand AI-generated or unfamiliar code.  
Paste a public GitHub repo URL, pick a file, and get:

- 📖 **Line-by-line explanations** in plain language
- 📝 **Study notes** in Markdown for revision
- 🧪 **A quiz** that tests real understanding, with explanations for every answer

---

## Prerequisites

- [Node.js v18 or later](https://nodejs.org/) (v24 recommended)
- VS Code with its integrated terminal
- An API key from [tokenlb.net](https://tokenlb.net) (or any OpenAI-compatible provider)

---

## Setup — Step by Step

Open **VS Code**, then open the `codetutor` folder (`File → Open Folder`).  
Use the integrated terminal (`Ctrl + backtick`) for all commands below.

---

### Step 1 — Set up the backend

```
cd server
```

Copy the example environment file:
```
copy .env.example .env
```

Open `server/.env` in VS Code and paste your real API key:
```
AI_BASE_URL=https://tokenlb.net/v1
AI_API_KEY=sk-YOUR-REAL-KEY-HERE
AI_MODEL=gpt-4o-mini
GITHUB_TOKEN=
PORT=8787
```
Save the file. **Never commit `.env` to git — it's in `.gitignore`.**

Install dependencies:
```
npm install
```

Start the backend:
```
npm run dev
```

You should see:
```
✅ CodeTutor server running at http://localhost:8787
```

Leave this terminal running.

---

### Step 2 — Set up the frontend

Open a **second terminal** in VS Code (`Ctrl+Shift+backtick`):

```
cd client
npm install
npm run dev
```

You should see something like:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Using CodeTutor

1. Paste a GitHub repo URL (e.g. `https://github.com/facebook/react` or `vercel/next.js`)
2. Click **Load Repo**
3. Browse the file tree on the left and click any file
4. Use the tabs to:
   - **Code** — view the raw source
   - **Explain** — AI explains every line
   - **Study Notes** — generated Markdown notes
   - **Quiz** — answer 5 questions, get instant feedback

---

## Folder Structure

```
codetutor/
├── server/
│   ├── src/
│   │   ├── index.js          ← Express entry point
│   │   ├── ai/
│   │   │   └── provider.js   ← AI provider interface (swap here!)
│   │   ├── db/
│   │   │   └── database.js   ← SQLite via better-sqlite3
│   │   └── routes/
│   │       ├── github.js     ← /api/github/* endpoints
│   │       └── ai.js         ← /api/ai/* endpoints
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/
    │   │   └── client.js     ← All API calls (never direct to AI/GitHub)
    │   └── components/
    │       ├── RepoLoader.jsx
    │       ├── FileTree.jsx
    │       ├── FileViewer.jsx
    │       ├── ExplainView.jsx
    │       ├── NotesView.jsx
    │       └── QuizView.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Swapping the AI Provider

All AI logic is isolated in **`server/src/ai/provider.js`**.  
Edit only that file to change providers:

### Use OpenAI directly
```js
// Change baseURL in provider.js:
baseURL: "https://api.openai.com/v1",
```
Or just set `AI_BASE_URL=https://api.openai.com/v1` in `.env`.

### Use Anthropic Claude
Replace the OpenAI client in `provider.js` with the Anthropic SDK:
```js
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.AI_API_KEY });

export async function chat(messages, { json = false } = {}) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages,
  });
  const text = response.content[0].text;
  if (json) return JSON.parse(text.replace(/```json|```/g, "").trim());
  return text;
}
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/github/files?repo=owner/repo` | List code files in a repo |
| GET | `/api/github/file?repo=...&path=...` | Fetch file contents |
| POST | `/api/ai/explain` | Line-by-line explanation |
| POST | `/api/ai/notes` | Markdown study notes |
| POST | `/api/ai/quiz` | Generate a 5-question quiz |
| POST | `/api/ai/quiz/result` | Save a quiz score |

AI endpoints are rate-limited to **20 requests per minute** per IP.

---

## Security Notes

- The API key lives **only** in `server/.env` — never in client code.
- The Vite proxy forwards `/api` requests to the backend; the browser never sees the key.
- `.env` is gitignored — it will not be committed.
- Request bodies are capped at 1 MB.
