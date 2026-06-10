import { useState, useMemo } from "react";

// Build a nested tree from flat file list
function buildTree(files) {
  const root = {};
  for (const file of files) {
    const parts = file.path.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!node[part]) node[part] = { __children: {} };
      node = node[part].__children;
    }
    const name = parts[parts.length - 1];
    node[name] = { __file: file };
  }
  return root;
}

function TreeNode({ name, node, onSelect, selectedPath, depth = 0 }) {
  const isFile = Boolean(node.__file);
  const [open, setOpen] = useState(depth < 2);

  if (isFile) {
    const active = node.__file.path === selectedPath;
    return (
      <button
        className={`file-tree__file ${active ? "file-tree__file--active" : ""}`}
        style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
        onClick={() => onSelect(node.__file)}
        title={node.__file.path}
      >
        <span className="file-tree__icon">📄</span>
        {name}
      </button>
    );
  }

  const children = node.__children || node;
  const childEntries = Object.entries(children).filter(([k]) => k !== "__children");

  return (
    <div className="file-tree__dir">
      <button
        className="file-tree__dir-btn"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="file-tree__icon">{open ? "📂" : "📁"}</span>
        {name}
      </button>
      {open && (
        <div>
          {childEntries
            .sort(([aName, aNode], [bName, bNode]) => {
              // Dirs first, then files
              const aIsFile = Boolean(aNode.__file);
              const bIsFile = Boolean(bNode.__file);
              if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
              return aName.localeCompare(bName);
            })
            .map(([childName, childNode]) => (
              <TreeNode
                key={childName}
                name={childName}
                node={childNode}
                onSelect={onSelect}
                selectedPath={selectedPath}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ files, onSelect, selectedPath }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const entries = Object.entries(tree);

  if (files.length === 0) {
    return <div className="file-tree__empty">No code files found in this repo.</div>;
  }

  return (
    <nav className="file-tree" aria-label="Repository files">
      <div className="file-tree__header">{files.length} files</div>
      {entries
        .sort(([aName, aNode], [bName, bNode]) => {
          const aIsFile = Boolean(aNode.__file);
          const bIsFile = Boolean(bNode.__file);
          if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
          return aName.localeCompare(bName);
        })
        .map(([name, node]) => (
          <TreeNode
            key={name}
            name={name}
            node={node}
            onSelect={onSelect}
            selectedPath={selectedPath}
            depth={0}
          />
        ))}
    </nav>
  );
}
