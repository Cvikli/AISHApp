import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Editor } from "@monaco-editor/react";
import { useAppContext } from '../contexts/AppContext';
import { parseDiff, renderContentFromDiff, updateDiffFromEdit } from '../utils/diffUtils';
import MonacoEditorHeader from './MonacoEditorHeader';
import { getLanguageFromExtension, getLanguageFromCommand } from '../utils/languageDetection';
import { defineMonacoTheme } from '../utils/monacoTheme';

const EditorContainer = styled.div`
  border: 1px solid ${props => props.theme.borderColor};
  margin: 10px 0;
  position: relative;
`;

const EditorWrapper = styled.div`
  .monaco-editor {
    min-height: 24px;
  }
`;

const ExecuteButton = styled.button`
  position: absolute;
  bottom: 4px;
  right: 10px;
  z-index: 10;
  padding: 4px 8px;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  cursor: pointer;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  min-width: 100px;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 5px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ExecuteCount = styled.span`
  margin-left: 5px;
  color: ${props => props.theme.textColor};
`;

const MonacoEditor = ({
  value,
  language,
  readOnly = false,
  isExecutable,
  messageTimestamp,
  theme,
}) => {
  const { saveFile, executeBlock } = useAppContext();
  const [editorLanguage, setEditorLanguage] = useState(language || 'plaintext');
  const [filename, setFilename] = useState('Untitled');
  const [isLoading, setIsLoading] = useState(false);
  const [executeCount, setExecuteCount] = useState(0);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [diff, setDiff] = useState([]);
  const [editorValue, setEditorValue] = useState('');
  const [decorations, setDecorations] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const widgetsRef = useRef([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const reconstructFileContent = useCallback(() => {
    return diff.map((change) => change.equalContent + change.insertContent).join('');
  }, [diff]);

  const handleUndo = useCallback(() => {
    // if (historyIndex > 0) {
    //   setDiff(changeHistory[historyIndex - 1]);
    //   const { content, decorations: newDecorations } = renderContentFromDiff(changeHistory[historyIndex - 1], monacoRef.current);
    //   setDecorations(newDecorations)
    //   setHistoryIndex((prev) => prev - 1);
    // }
  }, [changeHistory, historyIndex]);

  const handleRedo = useCallback(() => {
    // if (historyIndex < changeHistory.length - 1) {
    //   setDiff(changeHistory[historyIndex + 1]);
    //   const { content, decorations: newDecorations } = renderContentFromDiff(changeHistory[historyIndex + 1], monacoRef.current);
    //   setDecorations(newDecorations)
    //   setHistoryIndex((prev) => prev + 1);
    // }
  }, [changeHistory, historyIndex]);

  const handleDetailedChange = useCallback((value, event) => {
    const changes = event.changes;
    console.log(changes);
    console.log(isInitializing);
    console.log("isInitializing");
    if (isInitializing) return;

    setDiff((prevDiff) => {
      const newDiff = updateDiffFromEdit(prevDiff, changes);
      // setChangeHistory((prev) => [...prev.slice(0, historyIndex + 1), newDiff]);
      // setHistoryIndex((prev) => prev + 1);
      return newDiff;
    });

  }, [historyIndex, isInitializing]);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      if (!editor || !monaco) return;

      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Z, () => {
        editor.trigger('keyboard', 'undo', null);
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_Z, () => {
        editor.trigger('keyboard', 'redo', null);
      });

      defineMonacoTheme(monaco);
      monaco.editor.setTheme('one-monokai');

      setIsEditorReady(true);
    },
    []
  );

  useEffect(() => {
    console.log("DIFF updated????");
    console.log(diff);
  }, [diff]);

  useEffect(() => {
    if (!monacoRef.current || !isEditorReady) return;

    setIsInitializing(true);

    const initialDiff = parseDiff([['equal', value || '', '', '']]);
    setDiff(initialDiff);

    const { content, decorations: newDecorations } = renderContentFromDiff(initialDiff, monacoRef.current);
    setDecorations(newDecorations);

    setEditorValue(value);
    setChangeHistory([initialDiff]);
    setHistoryIndex(0);

    requestAnimationFrame(() => {
      setIsInitializing(false);
    });

  }, [value, isEditorReady]);

  useEffect(() => {
    let detectedFilename = 'Untitled';
    let detectedLanguage = language;

    if (editorValue.startsWith('meld ') || editorValue.startsWith('cat ')) {
      detectedLanguage = getLanguageFromCommand(editorValue);
      const match = editorValue.match(/(?:meld|cat\s+>)\s+(\S+)/);
      if (match) {
        detectedFilename = match[1];
      }
    } else {
      detectedLanguage = language;
    }

    setFilename(detectedFilename);
    setEditorLanguage(detectedLanguage);
  }, [editorValue, language]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current && decorations && decorations.length > 0) {
      const model = editorRef.current.getModel();
      if (model) {
        const oldDecorations = model.getAllDecorations();
        editorRef.current.deltaDecorations(
          oldDecorations.map((d) => d.id),
          []
        );

        const newDecorations = editorRef.current.deltaDecorations(
          [],
          decorations.map((d) => ({
            range: d.range,
            options: d.options,
          }))
        );

        addChangeButtons();

        return () => {
          if (editorRef.current) {
            editorRef.current.deltaDecorations(newDecorations, []);
            widgetsRef.current.forEach((widget) => {
              editorRef.current.removeContentWidget(widget);
            });
            widgetsRef.current = [];
          }
        };
      }
    }
  }, [decorations]);

  const handleExecute = useCallback(async () => {
    if (isExecutable) {
      setIsLoading(true);
      try {
        const fileContent = reconstructFileContent();
        const response = await executeBlock(fileContent, messageTimestamp);
        if (response.status === 'success' && response.diff) {
          console.log(response.diff);
          const newDiff = parseDiff(response.diff);
          console.log(newDiff);
          console.log("newDiff");
          setDiff(newDiff);

          const { content, decorations: newDecorations } = renderContentFromDiff(newDiff, monacoRef.current);
          setEditorValue(content);
          setDecorations(newDecorations);
          setChangeHistory((prev) => [...prev, newDiff]);
          setHistoryIndex((prev) => prev + 1);
        }
        setExecuteCount((prev) => prev + 1);
      } catch (error) {
        console.error('Error executing block:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isExecutable, messageTimestamp, executeBlock, reconstructFileContent]);

  const handleAcceptChange = useCallback(
    (changeId) => {
      if (!editorRef.current || !monacoRef.current) return;

      const editor = editorRef.current;
      const model = editor.getModel();
      const changeToAccept = diff.find(d => d.id === changeId);
      if (!changeToAccept) return;

      const text_do_delete_insert = changeToAccept.deleteContent + changeToAccept.insertContent;
      const fullContent = model.getValue();
      const startIndex = fullContent.indexOf(text_do_delete_insert);
      
      if (startIndex === -1) {
        console.error('Could not find the change in the editor content', changeId, " ", diff);
        return;
      }
      const startPosition = model.getPositionAt(startIndex);
      const endPosition = model.getPositionAt(startIndex + text_do_delete_insert.length);
      const range = new monacoRef.current.Range(
        startPosition.lineNumber,
        startPosition.column,
        endPosition.lineNumber,
        endPosition.column
      );

      const newText = changeToAccept.insertContent;

      editor.setPosition(startPosition);

      // Use model.applyEdits instead of editor.executeEdits
      model.applyEdits([{
        range: range,
        text: newText,
      }]);

      const updatedDiff = diff.map((d) =>
        d.id === changeId
          ? {
              ...d,
              type: (d.type.startsWith('char_') ? 'char_' : '') + 'equal',
              equalContent: newText,
              deleteContent: '',
              insertContent: '',
              decoration: null,
            }
          : d
      );

      const { decorations: newDecorations } = renderContentFromDiff(updatedDiff, monacoRef.current);
      setDecorations(newDecorations);
      setDiff(updatedDiff);
    },
    [diff]
  );

  const handleRejectChange = useCallback(
    (changeId) => {
      if (!editorRef.current || !monacoRef.current) return;

      const editor = editorRef.current;
      const model = editor.getModel();
      const changeToReject = diff.find(d => d.id === changeId);
      if (!changeToReject) return;

      const text_do_delete_insert = changeToReject.deleteContent + changeToReject.insertContent;
      const fullContent = model.getValue();
      const startIndex = fullContent.indexOf(text_do_delete_insert);
      
      if (startIndex === -1) {
        console.error('Could not find the change in the editor content');
        return;
      }

      const startPosition = model.getPositionAt(startIndex);
      const endPosition = model.getPositionAt(startIndex + text_do_delete_insert.length);
      const range = new monacoRef.current.Range(
        startPosition.lineNumber,
        startPosition.column,
        endPosition.lineNumber,
        endPosition.column
      );

      const newText = changeToReject.deleteContent;

      editor.setPosition(startPosition);

      // Use model.applyEdits instead of editor.executeEdits
      model.applyEdits([{
        range: range,
        text: newText,
      }]);

      const updatedDiff = diff.map((d) =>
        d.id === changeId
          ? {
              ...d,
              type: (d.type.startsWith('char_') ? 'char_' : '') + 'equal',
              equalContent: newText,
              deleteContent: '',
              insertContent: '',
              decoration: null,
            }
          : d
      );

      const { decorations: newDecorations } = renderContentFromDiff(updatedDiff, monacoRef.current);
      setDecorations(newDecorations);
      setDiff(updatedDiff);
    },
    [diff]
  );

  const addChangeButtons = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    widgetsRef.current.forEach((widget) => {
      editor.removeContentWidget(widget);
    });
    widgetsRef.current = [];

    diff.forEach((change) => {
      const { id, decoration } = change;
      if (decoration) {
        const widget = {
          getId: () => `change-${id}`,
          getPosition: () => ({
            position: {
              lineNumber: decoration.range.startLineNumber,
              column: editor.getModel().getLineMaxColumn(decoration.range.startLineNumber),
            },
            preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE_RIGHT],
          }),
          getDomNode: () => {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.right = '0';
            container.style.top = '0';
            container.style.zIndex = '1000';
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.alignItems = 'center';
            container.style.whiteSpace = 'nowrap';

            const createButton = (text, onClick, color) => {
              const button = document.createElement('button');
              button.innerText = text;
              button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              };
              button.style.fontSize = '12px';
              button.style.padding = '2px 4px';
              button.style.marginLeft = '2px';
              button.style.backgroundColor = theme.backgroundColor;
              button.style.color = color;
              button.style.border = `1px solid ${color}`;
              button.style.cursor = 'pointer';
              button.style.borderRadius = '3px';
              return button;
            };

            const acceptButton = createButton('✓', () => handleAcceptChange(id), '#4CAF50');
            const rejectButton = createButton('✗', () => handleRejectChange(id), '#F44336');

            container.appendChild(acceptButton);
            container.appendChild(rejectButton);

            return container;
          },
          
        };

        editor.addContentWidget(widget);
        widgetsRef.current.push(widget);
      }
    });
  }, [diff, theme, handleAcceptChange, handleRejectChange]);

  const editorOptions = {
    readOnly: readOnly || isInitializing,
    minimap: { enabled: false },
    fontSize: 20,
    fontWeight: '400',
    lineNumbers: 'on',
    renderLineHighlight: 'none',
    scrollBeyondLastLine: false,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: true,
    smoothScrolling: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12,
      useShadows: false,
      alwaysConsumeMouseWheel: false,
    },
    automaticLayout: true,
    glyphMargin: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    ...(isExecutable
      ? {
          contextmenu: false,
          extraEditorClassName: 'executable-code',
          actions: [
            {
              id: 'execute-code',
              label: 'Execute Code',
              keybindings: [],
              run: handleExecute,
            },
          ],
        }
      : {}),
  };

  const handleSave = useCallback(() => {
    // saveFile(filename, editorValue);
  }, [saveFile, filename, editorValue]);

  return (
    <EditorContainer>
      <MonacoEditorHeader
        filename={filename}
        onCopy={() => navigator.clipboard.writeText(editorValue)}
        onSave={handleSave}
        // onUndo={handleUndo}
        // onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < changeHistory.length - 1}
      />
      <EditorWrapper>
        {isExecutable && (
          <ExecuteButton onClick={handleExecute} $isVisible={isExecutable} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>EXECUTING</span>
              </>
            ) : (
              <>
                <span>EXECUTE</span>
                <ExecuteCount>{executeCount > 0 ? `(${executeCount})` : ''}</ExecuteCount>
              </>
            )}
          </ExecuteButton>
        )}
        <Editor
          height="600px"
          language={editorLanguage}
          value={editorValue}
          onMount={handleEditorDidMount}
          options={editorOptions}
          onChange={handleDetailedChange}
        />
      </EditorWrapper>
    </EditorContainer>
  );
};

export default MonacoEditor;
