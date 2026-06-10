export default function ExplainView({ explanation }) {
  // Split on line references to create annotated sections
  const lines = explanation.split("\n");

  return (
    <div className="explain-view">
      <div className="explain-view__content">
        {lines.map((line, i) => {
          // Highlight lines that start with "Line" or "Lines"
          const isLineRef = /^Lines?\s+\d+/i.test(line.trim());
          return (
            <p
              key={i}
              className={`explain-view__para ${isLineRef ? "explain-view__para--ref" : ""}`}
            >
              {line || <>&nbsp;</>}
            </p>
          );
        })}
      </div>
    </div>
  );
}
