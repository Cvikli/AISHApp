import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import styled from 'styled-components';
import { getLanguageFromExtension } from '../utils/languageDetection';
import { defineMonacoTheme } from '../utils/monacoTheme';
import MonacoEditorHeader from './MonacoEditorHeader';
import { useAppContext } from '../contexts/AppContext';
import { parseDiff, renderContentFromDiff, updateDiffFromEdit } from '../utils/diffUtils';

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

const MonacoEditor = ({ value, language, onChange, readOnly = false, isExecutable, messageTimestamp, theme }) => {
  const { saveFile, executeBlock } = useAppContext();
  const [editorLanguage, setEditorLanguage] = useState(language || "plaintext");
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

  useEffect(() => {
    if (!monacoRef.current) return;

    const initialDiff = parseDiff([['equal', value || '', '']]);
    setDiff(initialDiff);
    const { content: initialContent, decorations: initialDecorations } = renderContentFromDiff(initialDiff, monacoRef.current);
    setEditorValue(initialContent);
    setDecorations(initialDecorations);
    setChangeHistory([{ value: initialContent, decorations: initialDecorations }]);
    setHistoryIndex(0);
  }, [value, monacoRef]);

  useEffect(() => {
    let detectedFilename = 'Untitled';
    
    if (typeof editorValue === 'string' && editorValue.startsWith('meld ')) {
      const match = editorValue.match(/meld\s+(\S+)/);
      if (match) {
        detectedFilename = match[1];
        const extension = detectedFilename.split('.').pop().toLowerCase();
        setEditorLanguage(getLanguageFromExtension(extension));
      }
    } else {
      setEditorLanguage(language);
    }

    setFilename(detectedFilename);
  }, [editorValue, language]);

  const handleChange = useCallback((newValue) => {
    console.log("newValue")
    console.log(newValue)
    // const updatedDiff = updateDiffFromEdit(diff, newValue);
    // setDiff(updatedDiff);
    // const { content, decorations: newDecorations } = renderContentFromDiff(updatedDiff, monacoRef.current);
    // setEditorValue(content);
    // setDecorations(newDecorations);
    // if (onChange) {
    //   onChange(content);
    // }
  }, [diff, onChange]);

  const handleExecute = useCallback(async () => {
    if (isExecutable) {
      setIsLoading(true);
      try {
        const response = await executeBlock(editorValue, messageTimestamp);
        if (response.status === 'success' && response.diff) {
          console.log("response.diff");
          console.log(response.diff);
          const newDiff = parseDiff(response.diff);
          setDiff(newDiff);
          const { content, decorations: newDecorations } = renderContentFromDiff(newDiff, monacoRef.current);
          setEditorValue(content);
          setDecorations(newDecorations);
          console.log(newDecorations)
          setChangeHistory(prev => [...prev, { value: content, decorations: newDecorations }]);
          setHistoryIndex(prev => prev + 1);
        }
        setExecuteCount(prev => prev + 1);
      } catch (error) {
        console.error('Error executing block:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isExecutable, editorValue, messageTimestamp, executeBlock, historyIndex]);

  const handleAcceptChange = useCallback((changeId) => {
    setDiff(prevDiff => {
      const changeIndex = prevDiff.findIndex(d => d.id === changeId);
      if (changeIndex === -1) return prevDiff;

      const updatedDiff = [...prevDiff];
      const currentChange = updatedDiff[changeIndex];

      if (currentChange.type === 'equal') return prevDiff;

      updatedDiff[changeIndex] = {
        ...currentChange,
        type: 'equal',
        deletionContent: '',
      };

      const { content, decorations: newDecorations } = renderContentFromDiff(updatedDiff, monacoRef.current);
      setEditorValue(content);
      setDecorations(newDecorations);
      setChangeHistory(prev => [...prev, { value: content, decorations: newDecorations }]);
      setHistoryIndex(prev => prev + 1);
      if (onChange) {
        onChange(content);
      }
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }

      return updatedDiff;
    });
  }, [onChange]);

  const handleRejectChange = useCallback((changeId) => {
    setDiff(prevDiff => {
      const changeIndex = prevDiff.findIndex(d => d.id === changeId);
      if (changeIndex === -1) return prevDiff;

      const updatedDiff = [...prevDiff];
      const currentChange = updatedDiff[changeIndex];

      if (currentChange.type === 'equal') return prevDiff;

      updatedDiff[changeIndex] = {
        ...currentChange,
        type: 'equal',
        insertionContent: currentChange.deletionContent,
        deletionContent: '',
      };

      const { content, decorations: newDecorations } = renderContentFromDiff(updatedDiff, monacoRef.current);
      setEditorValue(content);
      setDecorations(newDecorations);
      setChangeHistory(prev => [...prev, { value: content, decorations: newDecorations }]);
      setHistoryIndex(prev => prev + 1);
      if (onChange) {
        onChange(content);
      }
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }
      return updatedDiff;
    });
  }, [onChange]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = changeHistory[historyIndex - 1];
      setEditorValue(prevState.value);
      setDecorations(prevState.decorations);
      setHistoryIndex(prev => prev - 1);
    }
  }, [changeHistory, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < changeHistory.length - 1) {
      const nextState = changeHistory[historyIndex + 1];
      setEditorValue(nextState.value);
      setDecorations(nextState.decorations);
      setHistoryIndex(prev => prev + 1);
    }
  }, [changeHistory, historyIndex]);

  const addChangeButtons = useCallback(() => {
    if (editorRef.current && monacoRef.current) {
      console.log('Adding change buttons');
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      // Remove existing content widgets
      const contentWidgets = editor.getContentWidgets();
      Object.keys(contentWidgets).forEach(widgetId => {
        editor.removeContentWidget(contentWidgets[widgetId]);
      });

      diff.forEach(change => {
        if (change.type.includes('insert_delete') || change.type.includes('char_insert_delete')) {
          if (!change.decoration || !change.decoration.range) {
            console.warn('Change has no valid decoration or range:', change);
            return;
          }

          const createWidget = (id) => ({
            getId: () => `change-${id}`,
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

              const acceptButton = createButton('✓', () => handleAcceptChange(change.decoration.id), '#4CAF50');
              const rejectButton = createButton('✗', () => handleRejectChange(change.decoration.id), '#F44336');

              container.appendChild(acceptButton);
              container.appendChild(rejectButton);

              return container;
            },
            getPosition: () => ({
              position: {
                lineNumber: change.decoration.range.startLineNumber,
                column: editor.getModel().getLineMaxColumn(change.decoration.range.startLineNumber)
              },
              preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE_RIGHT]
            })
          });
  
          editor.addContentWidget(createWidget(change.decoration.id));
          console.log('Added content widget for change:', change.id);
        }
      });
    }
  }, [diff, theme, handleAcceptChange, handleRejectChange]);
  
  useEffect(() => {
    if (editorRef.current && monacoRef.current && decorations.length > 0) {
      const model = editorRef.current.getModel();
      if (model) {
        const newDecorations = editorRef.current.deltaDecorations(
          [],
          decorations.map(d => ({
            range: d.range,
            options: d.options
          }))
        );

        addChangeButtons();

        return () => {
          if (editorRef.current) {
            editorRef.current.deltaDecorations(newDecorations, []);
            const contentWidgets = editorRef.current.getContribution('editor.contrib.contentWidgets');
            if (contentWidgets) {
              contentWidgets.saveViewState();
              contentWidgets.dispose();
            }
          }
        };
      }
    }
  }, [decorations, addChangeButtons]);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Z, () => handleUndo());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_Z, () => handleRedo());

    if (monaco) {
      defineMonacoTheme(monaco);
      monaco.editor.setTheme('one-monokai');
    }

    const initialDiff = parseDiff([['equal', value || '', '']]);
    const { content, decorations } = renderContentFromDiff(initialDiff, monaco);
    setEditorValue(content);
    setDecorations(decorations);

    addChangeButtons();
  }, [handleUndo, handleRedo, value, addChangeButtons]);

  const editorOptions = {
    readOnly: readOnly,
    minimap: { enabled: false },
    fontSize: 20,
    fontWeight: '400',
    lineNumbers: 'on',
    renderLineHighlight: 'all',
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
      alwaysConsumeMouseWheel: false
    },
    automaticLayout: true,
    glyphMargin: false,
    ...(isExecutable ? {
      contextmenu: false,
      extraEditorClassName: 'executable-code',
      actions: [
        {
          id: 'execute-code',
          label: 'Execute Code',
          keybindings: [],
          run: handleExecute
        }
      ]
    } : {})
  }

  const handleSave = useCallback(() => {
    saveFile(filename, editorValue);
  }, [saveFile, filename, editorValue]);

  return (
    <EditorContainer>
      <MonacoEditorHeader
        filename={filename}
        onCopy={() => navigator.clipboard.writeText(editorValue)}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
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
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </EditorWrapper>
    </EditorContainer>
  );
};

export default MonacoEditor;
