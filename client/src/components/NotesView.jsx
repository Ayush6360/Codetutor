// Simple markdown-to-HTML renderer (no external library needed)
function renderMarkdown(md) {
  return md
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Paragraphs: lines that are not headers or list items
    .replace(/^(?!<[hul]|<\/[ul])(.+)$/gm, (match) => {
      if (match.trim() === "") return "";
      return `<p>${match}</p>`;
    })
    // Clean up double-wrapped paragraphs
    .replace(/<p><(h[123]|ul|li)>/g, "<$1>")
    // Line breaks
    .replace(/\n{2,}/g, "");
}

export default function NotesView({ notes }) {
  const html = renderMarkdown(notes);

  return (
    <div
      className="notes-view"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
