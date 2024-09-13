export function parseDiff(diffArray, monaco) {
  let mergedCode = '', lineNumber = 1, column = 1;
  const decorations = [];
  let changeId = 0;

  const addContent = (content, className, type) => {
    console.log("content" , type, content, !content)
    if (!content) return;
    mergedCode += content;
    const lines = content.split('\n');
    
    const endLineNumber = lineNumber + lines.length-1;
    const endColumn = 1;
    console.log(lineNumber, column, endLineNumber, endColumn)

    if (className) {
      changeId++;
      decorations.push({
        range: new monaco.Range(
          lineNumber, column,
          endLineNumber-1,
          endColumn
        ),
        options: { 
          className,
          isWholeLine: true,
          linesDecorationsClassName: `glyph-${type}`,
          minimap: { position: 2 },
          hoverMessage: { value: `${type === 'deletion' ? 'Delete' : 'Insert'}: ${content}` },
          glyphMarginClassName: `glyph-${type}`,
          glyphMarginHoverMessage: { value: `${type === 'deletion' ? 'Delete' : 'Insert'}: ${content}` },
          zIndex: 1000,
        },
        id: changeId,
        type: type
      });
    }
    
    lineNumber = endLineNumber;
    column = endColumn;
  };
  let prev_type="none"
  diffArray.forEach(([type, insertContent, deleteContent]) => {
    console.log(["char_equal","char_insert_delete"].includes(prev_type), ["equal","insert_delete"].includes(type))
    if (["char_equal","char_insert_delete"].includes(prev_type) && ["equal","insert_delete"].includes(type)) {
      console.log("WE add that extre line!")
      mergedCode += '\n';
      lineNumber += 1;
      column = 1;
    }
    prev_type = type
    switch (type) {
      case 'equal': addContent(insertContent); break;
      case 'insert_delete':
        addContent(deleteContent, 'deletion-background', 'deletion');
        addContent(insertContent, 'insertion-background', 'insertion');
        break;
      case 'char_equal': 
        mergedCode += insertContent; 
        console.log(lineNumber, column, lineNumber, column + insertContent.length)
        column += insertContent.length; 
        break;
      case 'char_insert_delete':
        if (deleteContent) {
          mergedCode += deleteContent;
          changeId++;
          console.log(lineNumber, column, lineNumber, column + deleteContent.length)
          decorations.push({
            range: new monaco.Range(lineNumber, column, lineNumber, column + deleteContent.length),
            options: { 
              className: 'deletion-background',
              glyphMarginClassName: 'glyph-deletion',
              glyphMarginHoverMessage: { value: `Delete: ${deleteContent}` },
              zIndex: 1000,
            },
            id: changeId,
            type: 'deletion'
          });
          column += deleteContent.length;
        }
        if (insertContent) {
          mergedCode += insertContent;
          changeId++;
          console.log(lineNumber, column, lineNumber, column + insertContent.length)
          decorations.push({
            range: new monaco.Range(lineNumber, column, lineNumber, column + insertContent.length),
            options: { 
              className: 'insertion-background',
              glyphMarginClassName: 'glyph-insertion',
              glyphMarginHoverMessage: { value: `Insert: ${insertContent}` },
              zIndex: 1000,
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
