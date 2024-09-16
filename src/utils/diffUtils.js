export function parseDiff(diffArray) {
  let changeId = 0;
  return diffArray.map(([type, insertionContent, deletionContent]) => {
    const decoration = type.includes('insert') ? {
      className: `${type}-background`,
      glyphMarginClassName: `glyph-${type}`,
      glyphMarginHoverMessage: { value: `Inserted: ${insertionContent}` },
    } : null;

    return {
      id: changeId++,
      type,
      insertionContent,
      deletionContent,
      decoration,
    };
  });
}
export function renderContentFromDiff(diff, monaco) {
  let content = '';
  const decorations = [];
  let line = 1;
  let column = 1;

  diff.forEach(({ id, type, insertionContent, deletionContent, decoration }) => {
    const startLineNumber = line;
    const startColumn = column;

    if (decoration) {
      // Optionally, insert a placeholder for deletions
      const placeholder = ''; // e.g., '// Deleted code\n'
      content += placeholder;

      // Update positions based on the placeholder
      const lines = placeholder.split('\n');
      line += type.startsWith("char_") ? 0 : lines.length - 1;
      column = type.startsWith("char_") ? lines[lines.length - 1].length + 1 : 1;


      // Create a decoration for the deletion
      decorations.push({
        range: new monaco.Range(startLineNumber, startColumn, line, column),
        options: {
          isWholeLine: true,
          className: decoration.className,
          glyphMarginClassName: decoration.glyphMarginClassName,
          hoverMessage: decoration.glyphMarginHoverMessage,
        },
        id: id,
      });

      decorations.push({
        range: new monaco.Range(startLineNumber, startColumn, line, column),
        options: {
          className: decoration.className,
          glyphMarginClassName: decoration.glyphMarginClassName,
          hoverMessage: decoration.glyphMarginHoverMessage,
        },
        id: id,
      });
    } else {
      // Handle insertions and equal content
      content += insertionContent;
      const lines = insertionContent.split('\n');
      line += lines.length - 1;
      column = lines[lines.length - 1].length + 1;
    }
  });

  return { content, decorations };
}

export function updateDiffFromEdit(oldDiff, newContent) {
  const oldContent = oldDiff.map(d => d.insertionContent).join('');
  
  if (oldContent === newContent) {
    return oldDiff;
  }

  return [
    {
      id: Date.now(),
      type: 'insert_delete',
      insertionContent: newContent,
      deletionContent: oldContent,
      decoration: {
        className: 'insert_delete-background',
        glyphMarginClassName: 'glyph-insert_delete',
        glyphMarginHoverMessage: { value: `Changed content` },
      }
    }
  ];
}
