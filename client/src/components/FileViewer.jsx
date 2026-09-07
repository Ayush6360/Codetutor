import { useState } from "react";
import { SkeletonExplain, SkeletonNotes, SkeletonQuiz } from "./Skeleton.jsx";
import ExplainView from "./ExplainView.jsx";
import NotesView from "./NotesView.jsx";
import QuizView from "./QuizView.jsx";
import { explainCode, generateNotes, generateQuiz } from "../api/client.js";

const TABS = ["code", "explain", "notes", "quiz"];
const TAB_LABELS = { code: "Code", explain: "Explain", notes: "Study Notes", quiz: "Quiz" };

export default function FileViewer({ file, content, repo }) {
  const [activeTab, setActiveTab] = useState("code");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [explanation, setExplanation] = useState(null);
  const [notes, setNotes] = useState(null);
  const [questions, setQuestions] = useState(null);

  async function handleTabClick(tab) {
    setAiError(null);
    setActiveTab(tab);

    if (tab === "explain" && !explanation) {
      setAiLoading(true);
      try {
        const data = await explainCode(repo, file.path, content);
        setExplanation(data.explanation);
      } catch (err) {
        setAiError(err.message);
      } finally {
        setAiLoading(false);
      }
    }

    if (tab === "notes" && !notes) {
      setAiLoading(true);
      try {
        const data = await generateNotes(repo, file.path, content);
        setNotes(data.notes);
      } catch (err) {
        setAiError(err.message);
      } finally {
        setAiLoading(false);
      }
    }

    if (tab === "quiz" && !questions) {
      setAiLoading(true);
      try {
        const data = await generateQuiz(file.path, content);
        setQuestions(data.questions);
      } catch (err) {
        setAiError(err.message);
      } finally {
        setAiLoading(false);
      }
    }
  }

  const lines = content.split("\n");

  return (
    <div className="file-viewer">
      <header className="file-viewer__header">
        <span className="file-viewer__path">{file.path}</span>
        <span className="file-viewer__meta">{lines.length} lines</span>
      </header>

      <nav className="file-viewer__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`file-viewer__tab ${activeTab === tab ? "file-viewer__tab--active" : ""}`}
            onClick={() => handleTabClick(tab)}
            disabled={aiLoading && tab !== activeTab}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      <div className="file-viewer__body">
        {aiLoading && activeTab === "explain" && <SkeletonExplain />}
        {aiLoading && activeTab === "notes"   && <SkeletonNotes />}
        {aiLoading && activeTab === "quiz"    && <SkeletonQuiz />}

        {aiError && !aiLoading && (
          <div className="error-banner">
            <strong>Something went wrong:</strong> {aiError}
          </div>
        )}

        {!aiError && (
          <>
            {activeTab === "code" && (
              <pre className="code-block">
                <code>
                  {lines.map((line, i) => (
                    <div key={i} className="code-block__line">
                      <span className="code-block__ln">{i + 1}</span>
                      <span className="code-block__text">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            )}

            {activeTab === "explain" && !aiLoading && explanation && (
              <ExplainView explanation={explanation} />
            )}

            {activeTab === "notes" && !aiLoading && notes && (
              <NotesView notes={notes} />
            )}

            {activeTab === "quiz" && !aiLoading && questions && (
              <QuizView
                questions={questions}
                repo={repo}
                filePath={file.path}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}