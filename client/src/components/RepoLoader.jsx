import { useState } from "react";

export default function RepoLoader({ onLoad, loading }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onLoad(trimmed);
  }

  return (
    <form className="repo-loader" onSubmit={handleSubmit}>
      <div className="repo-loader__field">
        <label htmlFor="repo-input" className="repo-loader__label">
          GitHub Repository
        </label>
        <div className="repo-loader__row">
          <input
            id="repo-input"
            type="text"
            className="repo-loader__input"
            placeholder="e.g. facebook/react or https://github.com/facebook/react"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !input.trim()}
          >
            {loading ? "Loading…" : "Load Repo"}
          </button>
        </div>
      </div>
      <p className="repo-loader__hint">
        Public repositories only. Paste a GitHub URL or <code>owner/repo</code>.
      </p>
    </form>
  );
}
