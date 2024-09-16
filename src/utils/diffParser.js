export function parseDiff(diffArray, monaco) {
  let mergedCode = '';
  const decorations = [];
  let lineNumber = 1;
  let column = 1;
  let changeId = 0;

  const addContent = (content, type) => {
    if (!content) return;
    mergedCode += content;
    const lines = content.split('\n');
    const endLineNumber = lineNumber + lines.length - 1;
    const endColumn = 1;

    if (type) {
      changeId++;
      decorations.push({
        range: new monaco.Range(lineNumber, column, endLineNumber, endColumn),
        options: {
          className: `${type}-background`,
          isWholeLine: false,
          hoverMessage: { value: `${type === 'deletion' ? 'Delete' : 'Insert'}: ${content}` },
          glyphMarginClassName: `glyph-${type}`,
          glyphMarginHoverMessage: { value: `${type === 'deletion' ? 'Delete' : 'Insert'}: ${content}` },
        },
        id: changeId,
        type: type,
        content: content
      });
    }
    
    lineNumber = endLineNumber;
    column = endColumn;
  };
  let prev_type="none"
  diffArray.forEach(([type, insertContent, deleteContent]) => {
    if (["char_equal", "char_insert_delete"].includes(prev_type) && ["equal", "insert_delete"].includes(type)) {
      mergedCode += '\n';
      lineNumber += 1;
      column = 1;
    }
    prev_type = type;
    switch (type) {
      case 'equal': addContent(insertContent); break;
      case 'insert_delete':
        addContent(deleteContent, 'deletion');
        addContent(insertContent, 'insertion');
        break;
      case 'char_equal': 
        mergedCode += insertContent;
        column += insertContent.length; 
        break;
      case 'char_insert_delete':
        if (deleteContent) {
          mergedCode += deleteContent;
          changeId++;
          decorations.push({
            range: new monaco.Range(lineNumber, column, lineNumber, column + deleteContent.length),
            options: { 
              className: 'deletion-background',
              glyphMarginClassName: 'glyph-deletion',
              glyphMarginHoverMessage: { value: `Delete: ${deleteContent}` },
            },
            id: changeId,
            type: 'deletion'
          });
          column += deleteContent.length;
        }
        if (insertContent) {
          mergedCode += insertContent;
          changeId++;
          decorations.push({
            range: new monaco.Range(lineNumber, column, lineNumber, column + insertContent.length),
            options: { 
              className: 'insertion-background',
              glyphMarginClassName: 'glyph-insertion',
              glyphMarginHoverMessage: { value: `Insert: ${insertContent}` },
            },
            id: changeId,
            type: 'insertion'
          });
          column += insertContent.length;
        }
        break;
      default:
        console.warn("Unhandled diff type:", type);
    }
  });

  return { mergedCode, decorations };
}
