import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import githubRouter from "./routes/github.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 8787;

// ── Middleware ───────────────────────────────────────────────────────────────

// CORS — allow the Vite dev server on port 5173 (and any localhost for dev)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith("http://localhost")) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
}));

// Body parsing with a 1 MB limit
app.use(express.json({ limit: "1mb" }));

// Rate limiting on AI routes — 20 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait a moment and try again." },
});

// ── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/github", githubRouter);
app.use("/api/ai", aiLimiter, aiRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Endpoint not found." }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ CodeTutor server running at http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.AI_MODEL || "gpt-4o-mini"}`);
  console.log(`   Base URL: ${process.env.AI_BASE_URL || "(default OpenAI)"}`);
});
