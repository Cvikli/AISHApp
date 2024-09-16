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
  let prev_type = "equal"
  let content = '';
  const decorations = [];
  let line = 1;
  let column = 1;

  diff.forEach(({ id, type, insertionContent, deletionContent, decoration }) => {
    const isWholeLine = !type.startsWith("char_")
    if (prev_type.startsWith("char_") && !(type.startsWith("char_"))) { // TODO this has to be managed by the difflib!
      line +=1
      column=1
    }
    prev_type = type;

    const startLineNumber = line;
    const startColumn = column;
console.log(type)
    console.log(startLineNumber, startColumn);

    if ((insertionContent.length>0)){
      content += insertionContent;
      const lines = insertionContent.split('\n');
      
      line += type.startsWith("char_") ? 0 : lines.length - 1; // todo ez tulajdonképpen lehet jó is lenne lines.length-1 -el
      column = lines[lines.length - 1].length + 1;
      
      if (decoration) {
        console.log(line, column)
        console.log("INSERT:", insertionContent)
        console.log("decoration")
        console.log(decoration)
        let insert_class = (type.startsWith("char_") ? 'char_' : '') + 'insert-background' 
        // Optionally, insert a placeholder for deletions
        // Create a decoration for the deletion
        decorations.push({
          range: new monaco.Range(startLineNumber, startColumn, line-1, column),
          options: {
            isWholeLine: isWholeLine,
            className: insert_class,
            // glyphMarginClassName: decoration.glyphMarginClassName,
            hoverMessage: insertionContent,
          },
          id: id,
        });
      }
    }
    if ((deletionContent.length>0)){
      let delete_class = (type.startsWith("char_") ? 'char_' : '') + 'delete-background' 
      content += deletionContent;
      const dlines = deletionContent.split('\n');
      const dstartLineNumber = line;
      const dstartColumn = column;
      line += type.startsWith("char_") ? 0 : dlines.length - 1;
      column = dlines[dlines.length - 1].length + 1;

      decorations.push({
        range: new monaco.Range(dstartLineNumber, dstartColumn, line-1, column),
        options: {
          isWholeLine: isWholeLine,
          className: delete_class,
          // glyphMarginClassName: decoration.glyphMarginClassName,
          hoverMessage: deletionContent,
        },
        id: id+100000,
      });
      console.log(dstartLineNumber, dstartColumn)
      console.log(line, column)
      console.log("DELETE:", deletionContent)
    }
    if (decoration) {
      // Modify the decoration object in place
      decoration.id = id;
      decoration.type = type;
      decoration.insertionContent = insertionContent;
      decoration.deletionContent = deletionContent;

      // Create a new Range object using monaco
      decoration.range = new monaco.Range(startLineNumber,startColumn,line,column);
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
