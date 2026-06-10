// All API calls go through the Vite proxy → Express backend.
// The frontend never talks to GitHub or the AI provider directly.

const BASE = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE + "/api"
  : "/api";

async function apiFetch(url, options = {}) {
  const res = await fetch(BASE + url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ── GitHub ───────────────────────────────────────────────────────────────────

export function fetchRepoFiles(repo) {
  return apiFetch(`/github/files?repo=${encodeURIComponent(repo)}`);
}

export function fetchFileContent(repo, path) {
  return apiFetch(
    `/github/file?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`
  );
}

// ── AI ───────────────────────────────────────────────────────────────────────

export function explainCode(repo, path, code) {
  return apiFetch("/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo, path, code }),
  });
}

export function generateNotes(repo, path, code) {
  return apiFetch("/ai/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo, path, code }),
  });
}

export function generateQuiz(path, code) {
  return apiFetch("/ai/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, code }),
  });
}

export function saveQuizResult(repo, path, score, total) {
  return apiFetch("/ai/quiz/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo, path, score, total }),
  });
}
