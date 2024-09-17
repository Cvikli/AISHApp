// diffUtils.js
import { diffChars } from 'diff';

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
      insertContent,
      deleteContent,
      decoration,
    };
  });
}

export function renderContentFromDiff(diff, monaco) {
  let content = '';
  const decorations = [];
  let line = 1;
  let column = 1;

  diff.forEach(({ id, type, equalContent, insertContent, deleteContent, decoration }) => {
    const isWholeLine = !type.startsWith('char_');

    // Handle equal content
    if (equalContent.length > 0) {
      const lines = equalContent.split('\n');
      content += equalContent;
      line += lines.length - 1;
      column = lines[lines.length - 1].length + 1;
    }

    const startLineNumber = line;
    const startColumn = column;

    // Handle insertions
    if (insertContent.length > 0) {
      const lines = insertContent.split('\n');
      content += insertContent;
      line += lines.length - 1;
      column = lines[lines.length - 1].length + 1;

      const insertClass = (type.startsWith('char_') ? 'char_' : '') + 'insert-background';
      decorations.push({
        range: new monaco.Range(startLineNumber, startColumn, line - 1, column),
        options: {
          isWholeLine: isWholeLine,
          className: insertClass,
          hoverMessage: { value: `Inserted: ${insertContent}` },
        },
        id: id,
      });
    }

    // Handle deletions
    if (deleteContent.length > 0) {
      const deleteLines = deleteContent.split('\n');
      content += deleteContent;
      const deleteStartLine = line;
      const deleteStartColumn = column;

      line += deleteLines.length - 1;
      column = deleteLines[deleteLines.length - 1].length;

      const deleteClass = (type.startsWith('char_') ? 'char_' : '') + 'delete-background';

      decorations.push({
        range: new monaco.Range(deleteStartLine, deleteStartColumn, line - 1, column),
        options: {
          isWholeLine: isWholeLine,
          className: deleteClass,
          hoverMessage: { value: `Deleted: ${deleteContent}` },
        },
        id: id + 100000,
      });

      // Do not update `line` and `column` since deletions are not added to the content
    }

    // Update decoration range
    if (decoration) {
      decoration.id = id;
      decoration.range = new monaco.Range(startLineNumber, startColumn, line, column);
    }
  });

  return { content, decorations };
}


export function updateDiffFromEdit(oldDiffs, changes) {
  let changeIndex = 0;
  let currentOffset = 0;

  for (let i = 0; i < oldDiffs.length && changeIndex < changes.length; i++) {
    let diff = oldDiffs[i];
    const eqlen=diff.equalContent.length
    const inlen=diff.insertContent.length
    const delen=diff.deleteContent.length
    let diffLength = eqlen + inlen + delen;

    let multisameoffset = 0;

    while (changeIndex < changes.length && changes[changeIndex].rangeOffset < currentOffset + diffLength) {
      const change = changes[changeIndex];
      let localOffset = change.rangeOffset - currentOffset;
      if (localOffset < eqlen) diff.equalContent  = applyChange(diff.equalContent,  localOffset  + multisameoffset, change.text);
      localOffset -= eqlen
      if (localOffset < inlen) diff.insertContent = applyChange(diff.insertContent, localOffset + multisameoffset, change.text);
      localOffset -= inlen
      if (localOffset < delen) diff.deleteContent = applyChange(diff.deleteContent, localOffset + multisameoffset, change.text);

      changeIndex++;
      multisameoffset += change.text.length
    }
    currentOffset += diffLength;
  }

  // Apply any remaining changes
  while (changeIndex < changes.length) {
    oldDiffs.push({
      equalContent: changes[changeIndex].text,
      insertContent: '',
      deleteContent: '',
      type: 'equal'
    });
    changeIndex++;
  }

  // Remove any empty diff parts
  return oldDiffs.filter(diff => diff.equalContent || diff.insertContent || diff.deleteContent);
}

function applyChange(content, start, newText) {
  return content.slice(0, start) + newText + content.slice(start+1);
}
