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

const compareContent = (content, newContent, startIndex) => {
  for (let i = 0; i < content.length; i++) {
    if (content[i] !== newContent[startIndex + i]) {
      return { match: false, position: i };
    }
  }
  return { match: true, position: content.length };
};

const compareContentBackward = (content, newContent, endIndex) => {
  for (let i = content.length - 1, j = endIndex; i >= 0; i--, j--) {
    if (content[i] !== newContent[j]) {
      return { match: false, position: i };
    }
  }
  return { match: true, position: -1 };
};

const updateDiffFromEdit = (oldDiffs, newContent) => {
  const newDiffs = [];
  let newContentIndex = 0;
  let forwardIndex = 0;
  let backwardIndex = oldDiffs.length - 1;
  let forwardState = null;
  let forwardPosition = 0;
  let backwardState = null;
  let backwardPosition = 0;

  // Forward pass
  for (let i = 0; i < oldDiffs.length; i++) {
    const diff = oldDiffs[i];
    let matchFound = true;

    for (const state of ['equalContent', 'insertContent', 'deleteContent']) {
      if (diff[state]) {
        const result = compareContent(diff[state], newContent, newContentIndex);
        if (result.match) {
        } else {
          matchFound = false;
          forwardState = state;
          forwardPosition = result.position;
          forwardIndex = i;
          break;
        }
      }
    }

    if (matchFound) {
      newDiffs.push(diff);
    } else {
      break;
    }
  }

  // Backward pass
  let backwardContentIndex = newContent.length - 1;
  for (let i = oldDiffs.length - 1; i >= forwardIndex; i--) {
    const diff = oldDiffs[i];
    let matchFound = true;

    for (const state of ['equalContent', 'insertContent', 'deleteContent']) {
      if (diff[state]) {
        const result = compareContentBackward(diff[state], newContent, backwardContentIndex);
        if (result.match) {
        } else {
          matchFound = false;
          backwardState = state;
          backwardPosition = result.position;
          backwardIndex = i;
          break;
        }
      }
    }

    if (!matchFound) break;
  }

  // Handle the modified section
  const new_part = newContent.slice(newContentIndex, backwardContentIndex + 1)
  const equalCont  = oldDiffs[forwardIndex].equalContent
  const insertCont = oldDiffs[forwardIndex].insertContent
  const deleteCont = oldDiffs[forwardIndex].deleteContent
  const fstate = (forwardState   ==='equalContent' ? 1 : (forwardState  ==='insertContent' ? 2 : 3))
  const bstate = (backwardState  ==='equalContent' ? 1 : (backwardState  ==='insertContent' ? 2 : 3))
  let lastDiff = null;
  if (forwardIndex === backwardIndex) {
    newDiffs.push({
        ...oldDiffs[forwardIndex],
        equalContent:  (fstate === 1 ? equalCont.slice(0,forwardPosition)                   : equalCont) + 
                      (fstate === 1 ? new_part : '') + 
                      (1 === bstate ? equalCont.slice(backwardPosition,equalCont.length-1) : ''),
        insertContent: (fstate === 2 ? insertCont.slice(0,forwardPosition) : fstate === 3 ? insertCont : '') + 
                      (fstate === 2 ? new_part : '') + 
                      (2 === bstate ? insertCont.slice(backwardPosition,insertCont.length-1) : 1 === bstate ? insertCont : ''),
        deleteContent: (fstate === 3 ? deleteCont.slice(0,forwardPosition) : '') + 
                      (fstate === 3 ? new_part : '') +  
                      (3 === bstate ? deleteCont.slice(backwardPosition,deleteCont.length-1) : deleteCont),
    });
    lastDiff = newDiffs[newDiffs.length - 1];
    !lastDiff.equalContent && !lastDiff.insertContent && !lastDiff.deleteContent && newDiffs.pop();
  } else if (forwardIndex < backwardIndex) {
    newDiffs.push({
      ...oldDiffs[forwardIndex],
      equalContent:  (fstate  ===1 ? equalCont.slice( 0,forwardPosition) : equalCont)  + new_part,
      insertContent: (fstate  ===2 ? insertCont.slice(0,forwardPosition) : fstate === 3 ? insertCont : '') + new_part,
      deleteContent: (fstate  ===3 ? deleteCont.slice(0,forwardPosition) : '') + new_part,
    });
    lastDiff = newDiffs[newDiffs.length - 1];
    !lastDiff.equalContent && !lastDiff.insertContent && !lastDiff.deleteContent && newDiffs.pop();
    const bequalCont  = oldDiffs[backwardIndex].equalContent
    const binsertCont = oldDiffs[backwardIndex].insertContent
    const bdeleteCont = oldDiffs[backwardIndex].deleteContent
    newDiffs.push({
        ...oldDiffs[backwardIndex],
        equalContent: (bstate === 1 ? bequalCont.slice( backwardPosition,bequalCont.length-1) : ''),
        insertContent:(bstate === 2 ? binsertCont.slice(backwardPosition,binsertCont.length-1) : 1 === bstate ? binsertCont : ''),
        deleteContent:(bstate === 3 ? bdeleteCont.slice(backwardPosition,bdeleteCont.length-1) : bdeleteCont),
    });
    lastDiff = newDiffs[newDiffs.length - 1];
    !lastDiff.equalContent && !lastDiff.insertContent && !lastDiff.deleteContent && newDiffs.pop();

  }

  // Add remaining diffs
  newDiffs.push(...oldDiffs.slice(backwardIndex + 1));

  return newDiffs;
};

export { updateDiffFromEdit };
