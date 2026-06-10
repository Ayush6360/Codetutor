import { Router } from "express";

const router = Router();

// File extensions we consider "code"
const CODE_EXTENSIONS = new Set([
  "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "h",
  "cs", "go", "rb", "php", "rs", "swift", "kt", "html", "css", "sql",
]);

const MAX_FILE_SIZE = 100 * 1024; // 100 KB

function parseRepo(raw) {
  if (!raw) return null;
  // Accept "owner/repo" or full GitHub URLs
  const match = raw
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "")
    .match(/^([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function githubHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function ghFetch(url) {
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`GitHub API error ${res.status}`), {
      status: res.status,
      body,
    });
  }
  return res.json();
}

// GET /api/github/files?repo=owner/repo
router.get("/files", async (req, res) => {
  const parsed = parseRepo(req.query.repo);
  if (!parsed) {
    return res.status(400).json({ error: "Invalid repo. Use owner/repo or a full GitHub URL." });
  }
  const { owner, repo } = parsed;

  try {
    // 1. Get default branch
    const repoInfo = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = repoInfo.default_branch;

    // 2. Fetch full file tree
    const treeData = await ghFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    // 3. Filter to code files under the size limit
    const files = (treeData.tree || [])
      .filter((item) => {
        if (item.type !== "blob") return false;
        const ext = item.path.split(".").pop().toLowerCase();
        if (!CODE_EXTENSIONS.has(ext)) return false;
        if (item.size && item.size > MAX_FILE_SIZE) return false;
        return true;
      })
      .map((item) => ({ path: item.path, size: item.size }));

    return res.json({ owner, repo, branch, files });
  } catch (err) {
    console.error("GitHub /files error:", err.message);
    if (err.status === 404) {
      return res.status(404).json({ error: "Repository not found or is private." });
    }
    if (err.status === 403) {
      return res.status(429).json({ error: "GitHub rate limit hit. Add a GITHUB_TOKEN to .env." });
    }
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/github/file?repo=owner/repo&path=src/index.js
router.get("/file", async (req, res) => {
  const parsed = parseRepo(req.query.repo);
  const filePath = req.query.path;

  if (!parsed || !filePath) {
    return res.status(400).json({ error: "Missing repo or path parameter." });
  }
  const { owner, repo } = parsed;

  try {
    // Get default branch first
    const repoInfo = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = repoInfo.default_branch;

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const fileRes = await fetch(rawUrl, { headers: githubHeaders() });

    if (!fileRes.ok) {
      return res.status(fileRes.status).json({ error: `Could not fetch file: ${fileRes.statusText}` });
    }

    const content = await fileRes.text();
    return res.json({ path: filePath, content });
  } catch (err) {
    console.error("GitHub /file error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
