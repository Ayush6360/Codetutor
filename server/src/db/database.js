/**
 * Database layer using sql.js (pure JavaScript SQLite — no compilation needed).
 * Data is kept in memory and flushed to disk on every write.
 */

import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../codetutor.db");

// sql.js needs to be initialised asynchronously once, then used synchronously.
let db;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();

  // Load existing database file if it exists, otherwise start fresh
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      repo        TEXT NOT NULL,
      path        TEXT NOT NULL,
      type        TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      repo        TEXT NOT NULL,
      path        TEXT NOT NULL,
      score       INTEGER NOT NULL,
      total       INTEGER NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);

  persist();
  return db;
}

// Write the in-memory database back to disk after every change
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Exported helpers ─────────────────────────────────────────────────────────

export async function saveAnalysis(repo, filePath, type, content) {
  const d = await getDb();
  d.run(
    "INSERT INTO analyses (repo, path, type, content) VALUES (?, ?, ?, ?)",
    [repo, filePath, type, content]
  );
  persist();
}

export async function saveQuizResult(repo, filePath, score, total) {
  const d = await getDb();
  d.run(
    "INSERT INTO quiz_results (repo, path, score, total) VALUES (?, ?, ?, ?)",
    [repo, filePath, score, total]
  );
  persist();
}

export async function getCachedAnalysis(repo, filePath, type) {
  const d = await getDb();
  const result = d.exec(
    "SELECT content FROM analyses WHERE repo = ? AND path = ? AND type = ? ORDER BY created_at DESC LIMIT 1",
    [repo, filePath, type]
  );
  if (result.length === 0 || result[0].values.length === 0) return null;
  return { content: result[0].values[0][0] };
}

// Initialise on import so the server is ready immediately
getDb().catch(console.error);

export default { getDb };