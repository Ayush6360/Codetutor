import { useState } from "react";
import { saveQuizResult } from "../api/client.js";

export default function QuizView({ questions, repo, filePath }) {
  const [selected, setSelected] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  function handleSelect(qIndex, optIndex) {
    if (submitted) return;
    setSelected((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  }

  async function handleSubmit() {
    const finalScore = questions.reduce(
      (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
      0
    );
    setScore(finalScore);
    setSubmitted(true);

    // Save to DB
    setSaving(true);
    try {
      await saveQuizResult(repo, filePath, finalScore, questions.length);
    } catch {
      // Non-critical — just log
      console.warn("Could not save quiz result.");
    } finally {
      setSaving(false);
    }
  }

  const allAnswered = selected.every((s) => s !== null);
  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="quiz-view">
      {submitted && (
        <div className={`quiz-view__score ${pct >= 60 ? "quiz-view__score--pass" : "quiz-view__score--fail"}`}>
          <span className="quiz-view__score-num">{score}/{questions.length}</span>
          <span className="quiz-view__score-pct">{pct}%</span>
          <span className="quiz-view__score-label">
            {pct === 100 ? "Perfect! 🎉" : pct >= 80 ? "Great job! 👍" : pct >= 60 ? "Good effort! Keep studying." : "Keep going — you'll get there!"}
          </span>
        </div>
      )}

      <div className="quiz-view__questions">
        {questions.map((q, qi) => {
          const userAnswer = selected[qi];
          const correct = q.answer;
          const isCorrect = userAnswer === correct;

          return (
            <div
              key={qi}
              className={`quiz-question ${submitted ? (isCorrect ? "quiz-question--correct" : "quiz-question--wrong") : ""}`}
            >
              <p className="quiz-question__text">
                <span className="quiz-question__num">Q{qi + 1}.</span> {q.q}
              </p>
              <div className="quiz-question__options">
                {q.options.map((opt, oi) => {
                  let cls = "quiz-option";
                  if (submitted) {
                    if (oi === correct) cls += " quiz-option--correct";
                    else if (oi === userAnswer && !isCorrect) cls += " quiz-option--wrong";
                  } else if (userAnswer === oi) {
                    cls += " quiz-option--selected";
                  }

                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                    >
                      <span className="quiz-option__letter">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className={`quiz-question__why ${isCorrect ? "quiz-question__why--correct" : "quiz-question__why--wrong"}`}>
                  <strong>{isCorrect ? "✓ Correct!" : `✗ Incorrect. The right answer was "${q.options[correct]}".`}</strong>
                  <p>{q.why}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          className="btn btn--primary btn--large"
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          {allAnswered ? "Submit Answers" : `Answer all questions (${selected.filter(s => s !== null).length}/${questions.length})`}
        </button>
      )}

      {saving && <p className="quiz-view__saving">Saving result…</p>}
    </div>
  );
}
