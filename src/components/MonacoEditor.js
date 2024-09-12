import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Editor, DiffEditor } from "@monaco-editor/react";
import styled from 'styled-components';
import { getLanguageFromExtension } from '../utils/languageDetection';
import { useMonacoEditor } from '../hooks/useMonacoEditor';
import MonacoEditorHeader from './MonacoEditorHeader';

const EditorContainer = styled.div`
  border: 1px solid ${props => props.theme.borderColor};
  margin: 10px 0;
`;

const EditorWrapper = styled.div`
  .monaco-editor {
    min-height: 24px;
  }
`;

const ViewSwitchButton = styled.button`
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  padding: 5px 10px;
  cursor: pointer;
  margin-right: 10px;
`;

const MonacoEditor = forwardRef(({ value, language, onChange, readOnly = false, onScroll }, ref) => {
  const [editorLanguage, setEditorLanguage] = useState(language || "plaintext");
  const [editorValue, setEditorValue] = useState(value);
  const [filename, setFilename] = useState('Untitled');
  const [showMergeOptions, setShowMergeOptions] = useState(false);
  const [isDiffView, setIsDiffView] = useState(false);
  const [originalValue, setOriginalValue] = useState('');
  const { editorRef, handleEditorDidMount } = useMonacoEditor(onChange, onScroll);

  useEffect(() => {
    let processedValue = value;
    let detectedLanguage = language;
    let detectedFilename = 'Untitled';
    let isMeldCommand = false;

    if (value.startsWith('meld ')) {
      const match = value.match(/meld\s+(\S+)/);
      if (match) {
        detectedFilename = match[1];
        const extension = detectedFilename.split('.').pop().toLowerCase();
        detectedLanguage = getLanguageFromExtension(extension);

        // Remove the first line and the last three lines
        const lines = value.split('\n');
        processedValue = lines.slice(1, -3).join('\n');
        isMeldCommand = true;
      }
    }

    setEditorLanguage(detectedLanguage);
    setEditorValue(processedValue);
    setFilename(detectedFilename);
    setShowMergeOptions(isMeldCommand);
    setOriginalValue(processedValue); // Set the original value for diff view
  }, [value, language]);

  const handleScroll = useCallback((event) => {
    const editor = editorRef.current;
    if (!editor) return;

    const editorDOM = editor.getDomNode();
    if (!editorDOM) return;

    const { deltaY } = event;
    const scrollTop = editorDOM.scrollTop;
    const scrollHeight = editorDOM.scrollHeight;
    const clientHeight = editorDOM.clientHeight;

    const isScrollingUp = deltaY < 0;
    const isScrollingDown = deltaY > 0;

    const isAtTop = scrollTop === 0;
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 1;

    // Allow parent scrolling if we're at the top or bottom
    if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
      return;
    }

    // If we're not at the top or bottom, adjust the scroll after the default scroll
    requestAnimationFrame(() => {
      editor.setScrollTop(scrollTop);
    });

    if (onScroll) {
      onScroll(scrollTop);
    }
  }, [onScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorValue).then(() => {
      console.log('Content copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  const handleAccept = () => {
    console.log('Changes accepted');
    // Implement actual acceptance logic here
  };

  const handleReject = () => {
    console.log('Changes rejected');
    // Implement actual rejection logic here
  };

  const toggleView = () => {
    setIsDiffView(!isDiffView);
  };

  useImperativeHandle(ref, () => ({
    addContent: (newContent) => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        const lastLineNumber = model.getLineCount();
        const lastLineColumn = model.getLineMaxColumn(lastLineNumber);
        editorRef.current.executeEdits('', [{
          range: {
            startLineNumber: lastLineNumber,
            startColumn: lastLineColumn,
            endLineNumber: lastLineNumber,
            endColumn: lastLineColumn
          },
          text: newContent
        }]);
      }
    },
    setValue: (newValue) => {
      if (editorRef.current) {
        editorRef.current.setValue(newValue);
      }
    }
  }));

  return (
    <EditorContainer>
      <MonacoEditorHeader
        filename={filename}
        onCopy={handleCopy}
        onAccept={handleAccept}
        onReject={handleReject}
        showMergeOptions={showMergeOptions}
      >
        <ViewSwitchButton onClick={toggleView}>
          {isDiffView ? 'Unified View' : 'Diff View'}
        </ViewSwitchButton>
      </MonacoEditorHeader>
      <EditorWrapper onWheel={handleScroll}>
        {isDiffView ? (
          <DiffEditor
            height="auto"
            language={editorLanguage}
            original={originalValue}
            modified={editorValue}
            options={{
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
              renderSideBySide: true,
            }}
            onMount={handleEditorDidMount}
          />
        ) : (
          <Editor
            height="auto"
            language={editorLanguage}
            value={editorValue}
            onChange={onChange}
            options={{
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
              formatOnPaste: true,
              formatOnType: true,
              renderIndentGuides: true,
              renderValidationDecorations: 'on',
              suggestOnTriggerCharacters: true,
              tabSize: 2,
              wordWrap: 'on'
            }}
            onMount={handleEditorDidMount}
          />
        )}
      </EditorWrapper>
    </EditorContainer>
  );
});

export default MonacoEditor;
