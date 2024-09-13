import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import styled from 'styled-components';
import { getLanguageFromExtension } from '../utils/languageDetection';
import { defineMonacoTheme } from '../utils/monacoTheme';
import MonacoEditorHeader from './MonacoEditorHeader';
import { useAppContext } from '../contexts/AppContext';
import { parseDiff } from '../utils/diffParser';

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
  display: ${props => props.isVisible ? 'flex' : 'none'};
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

const ChangeButton = styled.button`
  position: absolute;
  top: 0;
  right: ${props => props.right}px;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  z-index: 1001;
`;

const MonacoEditor = forwardRef(({ value, language, onChange, readOnly = false, onScroll, isExecutable, autoExecute, messageTimestamp, theme }, ref) => {
  const { saveFile, executeBlock } = useAppContext();
  const [editorLanguage, setEditorLanguage] = useState(language || "plaintext");
  const [editorValue, setEditorValue] = useState(value);
  const [filename, setFilename] = useState('Untitled');
  const [isLoading, setIsLoading] = useState(false);
  const [executeCount, setExecuteCount] = useState(0);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [diffDecorations, setDiffDecorations] = useState([]);
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    let processedValue = value;
    let detectedFilename = 'Untitled';
    let isMeldCommand = false;

    if (value.startsWith('meld ')) {
      const match = value.match(/meld\s+(\S+)/);
      if (match) {
        detectedFilename = match[1];
        const extension = detectedFilename.split('.').pop().toLowerCase();
        setEditorLanguage(getLanguageFromExtension(extension));
        isMeldCommand = true;
      }
    } else {
      setEditorLanguage(language);
    }

    setEditorValue(processedValue);
    setFilename(detectedFilename);
  }, [value, language]);

  const handleChange = useCallback((newValue) => {
    setEditorValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleExecute = useCallback(async () => {
    if (isExecutable) {
      setIsLoading(true);
      try {
        const response = await executeBlock(editorValue, messageTimestamp);
        console.log('Execution response:', response);
        if (response.status === 'success') {
          if (response.diff) {
            const { mergedCode, decorations } = parseDiff(response.diff, monacoRef.current);
            setEditorValue(mergedCode);
            setDiffDecorations(decorations);
          } else {
            setEditorValue(response.ai_generated_content);
          }
        }
        setExecuteCount(prev => prev + 1);
      } catch (error) {
        console.error('Error executing block:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isExecutable, editorValue, messageTimestamp, executeBlock]);

  useEffect(() => {
    if (editorRef.current && diffDecorations.length > 0) {
      const decorations = editorRef.current.deltaDecorations([], diffDecorations);
      setChanges(diffDecorations.map((d, index) => ({ ...d, decorationId: decorations[index] })));
      return () => {
        editorRef.current.deltaDecorations(decorations, []);
      };
    }
  }, [diffDecorations]);

  // useEffect(() => {
  //   if (autoExecute && false) {
  //     handleExecute();
  //   }
  // }, [autoExecute, handleExecute]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorValue).then(() => {
      console.log('Content copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  const handleAcceptChange = (changeId) => {
    const change = changes.find(c => c.id === changeId);
    if (!change) return;

    const newValue = editorValue.split('\n');
    const startLine = change.range.startLineNumber - 1;
    const endLine = change.range.endLineNumber - 1;

    if (change.type === 'deletion') {
      newValue.splice(startLine, endLine - startLine + 1);
    }

    const updatedValue = newValue.join('\n');
    setEditorValue(updatedValue);
    onChange(updatedValue);

    const updatedDecorations = diffDecorations.filter(d => d.id !== changeId);
    setDiffDecorations(updatedDecorations);

    if (editorRef.current) {
      editorRef.current.removeContentWidget({ getId: () => `accept-${changeId}` });
      editorRef.current.removeContentWidget({ getId: () => `reject-${changeId}` });
    }
  };

  const handleRejectChange = (changeId) => {
    const change = changes.find(c => c.id === changeId);
    if (!change) return;

    const newValue = editorValue.split('\n');
    const startLine = change.range.startLineNumber - 1;
    const endLine = change.range.endLineNumber - 1;

    if (change.type === 'insertion') {
      newValue.splice(startLine, endLine - startLine + 1);
    }

    const updatedValue = newValue.join('\n');
    setEditorValue(updatedValue);
    onChange(updatedValue);

    const updatedDecorations = diffDecorations.filter(d => d.id !== changeId);
    setDiffDecorations(updatedDecorations);

    if (editorRef.current) {
      editorRef.current.removeContentWidget({ getId: () => `accept-${changeId}` });
      editorRef.current.removeContentWidget({ getId: () => `reject-${changeId}` });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      handleSave();
    });

    if (monaco) {
      defineMonacoTheme(monaco);
      monaco.editor.setTheme('one-monokai');
    }

    changes.forEach(change => {
      const createWidget = (id, text, onClick) => ({
        getId: () => id,
        getDomNode: () => {
          const button = document.createElement('button');
          button.innerText = text;
          button.onclick = onClick;
          button.style.position = 'absolute';
          button.style.zIndex = '1000';
          button.style.fontSize = '12px';
          button.style.padding = '2px 4px';
          button.style.background = theme.backgroundColor;
          button.style.color = theme.textColor;
          button.style.border = `1px solid ${theme.borderColor}`;
          button.style.cursor = 'pointer';
          return button;
        },
        getPosition: () => ({
          position: {
            lineNumber: change.range.startLineNumber,
            column: editor.getModel().getLineMaxColumn(change.range.startLineNumber)
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE_RIGHT]
        })
      });

      const acceptWidget = createWidget(`accept-${change.id}`, '✓', () => handleAcceptChange(change.id));
      const rejectWidget = createWidget(`reject-${change.id}`, '✗', () => handleRejectChange(change.id));

      editor.addContentWidget(acceptWidget);
      editor.addContentWidget(rejectWidget);
    });
  };

  const handleSave = useCallback(() => {
    saveFile(filename, editorValue);
  }, [saveFile, filename, editorValue]);

  useImperativeHandle(ref, () => ({
    setValue: (newValue) => {
      setEditorValue(newValue);
    }
  }));

  useEffect(() => {
    if (editorRef.current && diffDecorations.length > 0) {
      const decorations = editorRef.current.deltaDecorations([], diffDecorations);
      setChanges(diffDecorations.map((d, index) => ({ ...d, decorationId: decorations[index] })));

      // Add content widgets for accept/reject buttons
      changes.forEach(change => {
        const createWidget = (id, text, onClick) => ({
          getId: () => id,
          getDomNode: () => {
            const button = document.createElement('button');
            button.innerText = text;
            button.onclick = onClick;
            button.style.position = 'absolute';
            button.style.zIndex = '1000';
            button.style.fontSize = '12px';
            button.style.padding = '2px 4px';
            button.style.background = theme.backgroundColor;
            button.style.color = theme.textColor;
            button.style.border = `1px solid ${theme.borderColor}`;
            button.style.cursor = 'pointer';
            return button;
          },
          getPosition: () => ({
            position: {
              lineNumber: change.range.startLineNumber,
              column: editorRef.current.getModel().getLineMaxColumn(change.range.startLineNumber)
            },
            preference: [monacoRef.current.editor.ContentWidgetPositionPreference.ABOVE_RIGHT]
          })
        });

        const acceptWidget = createWidget(`accept-${change.id}`, '✓', () => handleAcceptChange(change.id));
        const rejectWidget = createWidget(`reject-${change.id}`, '✗', () => handleRejectChange(change.id));

        editorRef.current.addContentWidget(acceptWidget);
        editorRef.current.addContentWidget(rejectWidget);
      });

      return () => {
        editorRef.current.deltaDecorations(decorations, []);
        changes.forEach(change => {
          editorRef.current.removeContentWidget({ getId: () => `accept-${change.id}` });
          editorRef.current.removeContentWidget({ getId: () => `reject-${change.id}` });
        });
      };
    }
  }, [diffDecorations, theme]);

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
  };

  if (isExecutable) {
    editorOptions.contextmenu = false;
    editorOptions.extraEditorClassName = 'executable-code';
    editorOptions.actions = [
      {
        id: 'execute-code',
        label: 'Execute Code',
        keybindings: [],
        run: handleExecute
      }
    ];
  }

  return (
    <EditorContainer>
      <MonacoEditorHeader
        filename={filename}
        onCopy={() => navigator.clipboard.writeText(editorValue)}
        onSave={handleSave}
        showMergeOptions={false}
      />
      <EditorWrapper onWheel={onScroll}>
        {isExecutable && (
          <ExecuteButton onClick={handleExecute} isVisible={isExecutable} disabled={isLoading}>
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
});

export default MonacoEditor;

