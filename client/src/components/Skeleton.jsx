// client/src/components/Skeleton.jsx

export function SkeletonLine({ width = "100%", height = "14px", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "4px", ...style }}
    />
  );
}

export function SkeletonExplain() {
  return (
    <div className="explain-view" aria-label="Loading explanation…">
      {/* Block 1 */}
      <div style={{ marginBottom: "24px" }}>
        <SkeletonLine width="30%" height="13px" style={{ marginBottom: "10px" }} />
        <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="92%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="85%" />
      </div>
      {/* Block 2 */}
      <div style={{ marginBottom: "24px" }}>
        <SkeletonLine width="25%" height="13px" style={{ marginBottom: "10px" }} />
        <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="88%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="76%" />
      </div>
      {/* Block 3 */}
      <div style={{ marginBottom: "24px" }}>
        <SkeletonLine width="35%" height="13px" style={{ marginBottom: "10px" }} />
        <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="94%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="60%" />
      </div>
      {/* Block 4 */}
      <div style={{ marginBottom: "24px" }}>
        <SkeletonLine width="28%" height="13px" style={{ marginBottom: "10px" }} />
        <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
        <SkeletonLine width="80%" />
      </div>
    </div>
  );
}

export function SkeletonNotes() {
  return (
    <div className="notes-view" aria-label="Loading notes…">
      {/* Title */}
      <SkeletonLine width="50%" height="22px" style={{ marginBottom: "24px" }} />
      {/* Section 1 */}
      <SkeletonLine width="30%" height="17px" style={{ marginBottom: "12px" }} />
      <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
      <SkeletonLine width="90%" style={{ marginBottom: "6px" }} />
      <SkeletonLine width="75%" style={{ marginBottom: "24px" }} />
      {/* Section 2 */}
      <SkeletonLine width="35%" height="17px" style={{ marginBottom: "12px" }} />
      <SkeletonLine width="100%" style={{ marginBottom: "6px" }} />
      <SkeletonLine width="85%" style={{ marginBottom: "6px" }} />
      <SkeletonLine width="70%" style={{ marginBottom: "6px" }} />
      <SkeletonLine width="90%" style={{ marginBottom: "24px" }} />
      {/* Section 3 - bullet list */}
      <SkeletonLine width="28%" height="17px" style={{ marginBottom: "12px" }} />
      {[80, 70, 90, 65, 75].map((w, i) => (
        <SkeletonLine key={i} width={`${w}%`} style={{ marginBottom: "8px", marginLeft: "20px" }} />
      ))}
    </div>
  );
}

export function SkeletonQuiz() {
  return (
    <div className="quiz-view" aria-label="Loading quiz…">
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {[1, 2, 3].map((q) => (
          <div
            key={q}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
            }}
          >
            {/* Question text */}
            <SkeletonLine width="15%" height="12px" style={{ marginBottom: "10px" }} />
            <SkeletonLine width="90%" height="15px" style={{ marginBottom: "6px" }} />
            <SkeletonLine width="70%" height="15px" style={{ marginBottom: "18px" }} />
            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3, 4].map((o) => (
                <div
                  key={o}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 14px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div
                    className="skeleton"
                    style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0 }}
                  />
                  <SkeletonLine width={`${55 + o * 8}%`} height="13px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}