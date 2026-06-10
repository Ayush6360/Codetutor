import { useState } from "react";
import RepoLoader from "./components/RepoLoader.jsx";
import FileTree from "./components/FileTree.jsx";
import FileViewer from "./components/FileViewer.jsx";
import { fetchRepoFiles, fetchFileContent } from "./api/client.js";

export default function App() {
  const [repoInfo, setRepoInfo] = useState(null);       // { owner, repo, branch, files }
  const [repoInput, setRepoInput] = useState("");        // The raw input string
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  async function handleLoadRepo(rawInput) {
    setRepoError(null);
    setRepoInfo(null);
    setSelectedFile(null);
    setFileContent(null);
    setRepoInput(rawInput);
    setRepoLoading(true);

    try {
      const data = await fetchRepoFiles(rawInput);
      setRepoInfo(data);
    } catch (err) {
      setRepoError(err.message);
    } finally {
      setRepoLoading(false);
    }
  }

  async function handleSelectFile(file) {
    if (selectedFile?.path === file.path) return;
    setSelectedFile(file);
    setFileContent(null);
    setFileError(null);
    setFileLoading(true);

    try {
      const data = await fetchFileContent(repoInput, file.path);
      setFileContent(data.content);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }

  const repoSlug = repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : "";

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">
          <span className="app__logo-icon">🧠</span>
          <span className="app__logo-text">CodeTutor</span>
        </div>
        <p className="app__tagline">Understand code, not just run it</p>
      </header>

      <main className="app__main">
        <div className="app__loader">
          <RepoLoader onLoad={handleLoadRepo} loading={repoLoading} />

          {repoError && (
            <div className="error-banner">
              <strong>Could not load repository:</strong> {repoError}
            </div>
          )}
        </div>

        {repoInfo && (
          <div className="app__workspace">
            <aside className="app__sidebar">
              <div className="app__repo-info">
                <span className="app__repo-name">
                  <a
                    href={`https://github.com/${repoSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repoSlug}
                  </a>
                </span>
                <span className="app__repo-branch">🌿 {repoInfo.branch}</span>
              </div>
              <FileTree
                files={repoInfo.files}
                onSelect={handleSelectFile}
                selectedPath={selectedFile?.path}
              />
            </aside>

            <section className="app__content">
              {!selectedFile && (
                <div className="empty-state">
                  <span className="empty-state__icon">👈</span>
                  <p>Select a file from the tree to get started.</p>
                </div>
              )}

              {selectedFile && fileLoading && (
                <div className="loading-state">
                  <div className="loading-state__spinner" />
                  <p className="loading-state__text">Loading file…</p>
                </div>
              )}

              {selectedFile && fileError && (
                <div className="error-banner">
                  <strong>Could not load file:</strong> {fileError}
                </div>
              )}

              {selectedFile && fileContent && (
                <FileViewer
                  file={selectedFile}
                  content={fileContent}
                  repo={repoSlug}
                />
              )}
            </section>
          </div>
        )}

        {!repoInfo && !repoLoading && !repoError && (
          <div className="hero">
            <div className="hero__steps">
              <div className="hero__step">
                <span className="hero__step-num">1</span>
                <div>
                  <strong>Paste a GitHub repo URL</strong>
                  <p>Any public repository works — try one from class!</p>
                </div>
              </div>
              <div className="hero__step">
                <span className="hero__step-num">2</span>
                <div>
                  <strong>Pick a file</strong>
                  <p>Browse the file tree and open any code file.</p>
                </div>
              </div>
              <div className="hero__step">
                <span className="hero__step-num">3</span>
                <div>
                  <strong>Learn</strong>
                  <p>Get a line-by-line explanation, study notes, or take a quiz.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
