// diffUtils.js
export function parseDiff(diffArray) {
  let changeId = 0;
  return diffArray.map(([type, equalContent, insertContent, deleteContent]) => {
    const hasChange = insertContent.length > 0 || deleteContent.length > 0;
    const decoration = hasChange
      ? {
          className: `${type}-background`,
          glyphMarginClassName: `glyph-${type}`,
          glyphMarginHoverMessage: { value: `Change detected` },
        }
      : null;

    return {
      id: changeId++,
      type,
      equalContent,
      deleteContent,
      insertContent,
      decoration,
    };
  });
}

export function renderContentFromDiff(diff, monaco) {
  let content = '';
  const decorations = [];
  let line = 1;
  let column = 1;

  diff.forEach(({ id, type, equalContent, deleteContent, insertContent, decoration }) => {
    const isWholeLine = !type.startsWith('char_');

    // Handle equal content
    if (equalContent.length > 0) {
      const lines = equalContent.split('\n');
      content += equalContent;
      line += lines.length - 1;
      column = lines[lines.length - 1].length + 1;
    }

    const deleteStartLine = line;
    const deleteStartColumn = column;

    // Handle deletions
    if (deleteContent.length > 0) {
      const deleteLines = deleteContent.split('\n');
      content += deleteContent;

      line += deleteLines.length - 1;
      column = deleteLines[deleteLines.length - 1].length + 1;

      const deleteClass = (type.startsWith('char_') ? 'char_' : '') + 'delete-background';

      decorations.push({
        range: new monaco.Range(deleteStartLine, deleteStartColumn, line - 1, column),
        options: {
          isWholeLine: isWholeLine,
          className: deleteClass,
          hoverMessage: { value: `Deleted: ${deleteContent}` },
        },
        id: id,
      });

      // Do not update `line` and `column` since deletions are not added to the content
    }

    // Handle insertions
    if (insertContent.length > 0) {
      const insrtlines = insertContent.split('\n');
      const startLineNumber = line;
      const startColumn = column;
      content += insertContent;
      line += insrtlines.length - 1;
      column = insrtlines[insrtlines.length - 1].length + 1;

      const insertClass = (type.startsWith('char_') ? 'char_' : '') + 'insert-background';
      decorations.push({
        range: new monaco.Range(startLineNumber, startColumn, line - 1, column),
        options: {
          isWholeLine: isWholeLine,
          className: insertClass,
          hoverMessage: { value: `Inserted: ${insertContent}` },
        },
        id: id + 100000,
      });
    }

    // Update decoration range
    if (decoration) {
      decoration.id = id;
      decoration.range = new monaco.Range(deleteStartLine, deleteStartColumn, line, column);
    }
  });
  return { content, decorations };
}

export function updateDiffFromEdit(oldDiffs, changes) {
  let changeIndex = 0;
  let currentOffset = 0;

  for (let i = 0; i < oldDiffs.length && changeIndex < changes.length; i++) {
    let diff = oldDiffs[i];
    const eqlen = diff.equalContent.length;
    const delen = diff.deleteContent.length;
    const inlen = diff.insertContent.length;
    let diffLength = eqlen + delen + inlen;

    let multisameoffset = 0;

    while (changeIndex < changes.length && changes[changeIndex].rangeOffset < currentOffset + diffLength) {
      const change = changes[changeIndex];
      let localOffset = change.rangeOffset - currentOffset;
      const rangeLength = change.rangeLength || 0;

      if (0 <= localOffset < eqlen) {
        diff.equalContent = applyChange(diff.equalContent, localOffset + multisameoffset, change.text, rangeLength);
      }
      localOffset -= eqlen;
      if (0 <= localOffset < delen) {
        diff.deleteContent = applyChange(diff.deleteContent, localOffset + multisameoffset, change.text, rangeLength);
      }
      localOffset -= delen;
      if (0 <= localOffset < inlen) {
        diff.insertContent = applyChange(diff.insertContent, localOffset + multisameoffset, change.text, rangeLength);
      }

      changeIndex++;
      multisameoffset += change.text.length - rangeLength;
    }
    currentOffset += diffLength;
  }

  // Apply any remaining changes
  while (changeIndex < changes.length) {
    oldDiffs.push({
      equalContent: changes[changeIndex].text,
      deleteContent: '',
      insertContent: '',
      type: 'equal'
    });
    changeIndex++;
  }

  // Remove any empty diff parts
  return oldDiffs.filter(diff => diff.equalContent || diff.deleteContent || diff.insertContent);
}

function applyChange(content, start, newText, rangeLength) {
  // Remove the specified range
  const beforeDeletion = content.slice(0, start);
  const afterDeletion = content.slice(start + rangeLength);
  
  // Insert the new text
  return beforeDeletion + newText + afterDeletion;
}
