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
  let newDiffs = [];
  let changeIndex = 0;
  let currentOffset = 0;

  for (let i = 0; i < oldDiffs.length && changeIndex < changes.length; i++) {
    let diff = oldDiffs[i];
    let diffLength = diff.equalContent.length + diff.insertContent.length + diff.deleteContent.length;

    while (changeIndex < changes.length && changes[changeIndex].rangeOffset < currentOffset + diffLength) {
      const change = changes[changeIndex];
      const localOffset = change.rangeOffset - currentOffset;
      const endOffset = Math.min(localOffset + change.rangeLength, diffLength);

      if (localOffset < diff.equalContent.length) {
        diff.equalContent = applyChange(diff.equalContent, localOffset, endOffset, change.text);
      } else if (localOffset < diff.equalContent.length + diff.insertContent.length) {
        const insertOffset = localOffset - diff.equalContent.length;
        diff.insertContent = applyChange(diff.insertContent, insertOffset, endOffset - diff.equalContent.length, change.text);
      } else {
        const deleteOffset = localOffset - diff.equalContent.length - diff.insertContent.length;
        diff.deleteContent = applyChange(diff.deleteContent, deleteOffset, endOffset - diff.equalContent.length - diff.insertContent.length, '');
      }

      changeIndex++;
      diffLength += change.text.length - (endOffset - localOffset);
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

function applyChange(content, start, end, newText) {
  return content.slice(0, start) + newText + content.slice(end);
}
