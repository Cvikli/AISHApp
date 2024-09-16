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


export function updateDiffFromEdit(oldDiff, newContent) {
  // Reconstruct the old content and get diff item boundaries
  const { oldContent, diffBoundaries } = reconstructContentWithBoundaries(oldDiff);

  // Compute the diff between oldContent and newContent using a diff algorithm
  const diff = require('diff');
  const diffResult = diff.diffChars(oldContent, newContent);

  // Map the diff results back to the diff items
  const updatedDiff = mapDiffResultToDiffItems(diffResult, oldDiff, diffBoundaries);

  // Merge adjacent diff items of the same type to reduce duplication
  const mergedDiff = mergeAdjacentDiffs(updatedDiff);

  return mergedDiff;
}
function reconstructContentWithBoundaries(diff) {
  let content = '';
  const diffBoundaries = [];
  diff.forEach((diffItem) => {
    const segment = getDiffItemContent(diffItem);
    const start = content.length;
    content += segment;
    const end = content.length;
    diffBoundaries.push({ start, end });
  });
  return { oldContent: content, diffBoundaries };
}

function getDiffItemContent(diffItem) {
  return diffItem.equalContent + diffItem.insertContent + diffItem.deleteContent;
}
function mapDiffResultToDiffItems(diffResult, oldDiff, diffBoundaries) {
  let updatedDiff = [];
  let currentIndex = 0; // Index in the old content
  let diffItemIndex = 0; // Index in the diff items

  diffResult.forEach((part) => {
    const { added, removed, value } = part;
    const length = value.length;

    if (added) {
      // Content was added; create a new insert diff item
      updatedDiff.push({
        id: generateNewId(),
        type: 'insert',
        equalContent: '',
        insertContent: value,
        deleteContent: '',
        decoration: null,
      });
    } else if (removed) {
      // Content was removed; create a new delete diff item
      updatedDiff.push({
        id: generateNewId(),
        type: 'delete',
        equalContent: '',
        insertContent: '',
        deleteContent: value,
        decoration: null,
      });
      currentIndex += length;
    } else {
      // Content is unchanged or modified within existing diff items
      let remainingLength = length;
      while (remainingLength > 0 && diffItemIndex < oldDiff.length) {
        const boundary = diffBoundaries[diffItemIndex];
        const diffItem = oldDiff[diffItemIndex];
        const diffItemLength = boundary.end - boundary.start;
        const takeLength = Math.min(remainingLength, diffItemLength - (currentIndex - boundary.start));

        const unchangedValue = value.substr(length - remainingLength, takeLength);

        // Determine if the content within the diff item has changed
        const originalSegment = getDiffItemContent(diffItem).substr(currentIndex - boundary.start, takeLength);
        if (originalSegment === unchangedValue) {
          // No change within this segment
          updatedDiff.push({
            ...diffItem,
            equalContent: unchangedValue,
            insertContent: '',
            deleteContent: '',
          });
        } else {
          // Content modified within the diff item
          updatedDiff.push({
            id: diffItem.id,
            type: 'equal',
            equalContent: unchangedValue,
            insertContent: '',
            deleteContent: '',
            decoration: null,
          });
        }

        remainingLength -= takeLength;
        currentIndex += takeLength;

        // Move to the next diff item if we've reached the end of the current one
        if (currentIndex >= boundary.end) {
          diffItemIndex++;
        }
      }
    }
  });

  return updatedDiff;
}

function mergeAdjacentDiffs(diffArray) {
  if (diffArray.length === 0) return diffArray;

  const mergedDiffs = [];
  let prevDiff = diffArray[0];

  for (let i = 1; i < diffArray.length; i++) {
    const currentDiff = diffArray[i];
    if (
      currentDiff.type === prevDiff.type &&
      currentDiff.type !== 'delete' // Keep deletions separate to maintain accurate positions
    ) {
      // Merge the contents
      prevDiff.equalContent += currentDiff.equalContent;
      prevDiff.insertContent += currentDiff.insertContent;
      prevDiff.deleteContent += currentDiff.deleteContent;
    } else {
      mergedDiffs.push(prevDiff);
      prevDiff = currentDiff;
    }
  }
  mergedDiffs.push(prevDiff);

  return mergedDiffs;
}

let nextId = 1000000; // Starting ID for new diff items

function generateNewId() {
  return nextId++;
}


