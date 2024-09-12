import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Editor } from "@monaco-editor/react";
import styled from 'styled-components';

const EditorWrapper = styled.div`
  .monaco-editor {
    min-height: 24px;
  }
`;

const MonacoEditor = forwardRef(({ value, language, onChange, readOnly = false, onScroll }, ref) => {
  const editorRef = useRef(null);
  const wrapperRef = useRef(null);
  const [editorLanguage, setEditorLanguage] = useState(language || "plaintext");
  const [editorValue, setEditorValue] = useState(value);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    let processedValue = value;
    let detectedLanguage = language;

    if (value.startsWith('meld ')) {
      const match = value.match(/meld\s+(\S+)/);
      if (match) {
        const filename = match[1];
        const extension = filename.split('.').pop().toLowerCase();
        detectedLanguage = getLanguageFromExtension(extension);

        // Remove the first line and the last three lines
        const lines = value.split('\n');
        processedValue = lines.slice(1, -3).join('\n');
      }
    }

    setEditorLanguage(detectedLanguage);
    setEditorValue(processedValue);
  }, [value, language]);

  const getLanguageFromExtension = (extension) => {
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'svg': 'xml',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'scala': 'scala',
      'kt': 'kotlin',
      'swift': 'swift',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'ps1': 'powershell',
      'bat': 'bat',
      'cmd': 'bat',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'sql': 'sql',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'dart': 'dart',
      'lua': 'lua',
      'r': 'r',
      'jl': 'julia',
      'ex': 'elixir',
      'exs': 'elixir',
      'erl': 'erlang',
      'hrl': 'erlang',
      'clj': 'clojure',
      'fs': 'fsharp',
      'fsx': 'fsharp',
      'vb': 'vb',
      'asm': 'assembly',
      'pl': 'perl',
      'groovy': 'groovy',
      'dockerfile': 'dockerfile',
      'tex': 'latex',
    };
    return languageMap[extension] || 'plaintext';
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define One Monokai theme
    monaco.editor.defineTheme('one-monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'bbc2cf' },
        { token: 'comment', foreground: '676f7d', fontStyle: 'italic' },
        { token: 'string', foreground: 'e5c07b' },
        { token: 'number', foreground: 'c678dd' },
        { token: 'constant.numeric', foreground: 'c678dd' },
        { token: 'constant.language', foreground: '56b6c2' },
        { token: 'constant.character', foreground: '56b6c2' },
        { token: 'constant.other', foreground: '56b6c2' },
        { token: 'variable', foreground: 'cc7832' },
        { token: 'variable.language', foreground: 'cc7832' },
        { token: 'variable.other', foreground: 'abb2bf' },
        { token: 'keyword', foreground: 'cc7832', fontStyle: 'bold' },
        { token: 'storage', foreground: 'cc7832', fontStyle: 'bold' },
        { token: 'storage.type', foreground: '56b6c2', fontStyle: 'bold italic' },
        { token: 'entity.name.class', foreground: '61afef', fontStyle: 'bold' },
        { token: 'entity.name.function', foreground: '98c379', fontStyle: 'bold' },
        { token: 'support.function', foreground: '98c379', fontStyle: 'bold' },
        { token: 'support.constant', foreground: '56b6c2' },
        { token: 'support.type', foreground: '56b6c2' },
        { token: 'support.class', foreground: '61afef', fontStyle: 'bold' },
        { token: 'support.other.variable', foreground: 'abb2bf' },
        { token: 'invalid', foreground: 'f8f8f0', background: 'c678dd' },
        { token: 'invalid.deprecated', foreground: 'f8f8f0', background: '56b6c2' },
        { token: 'meta.function-call', foreground: 'abb2bf' },
        { token: 'delimiter.bracket', foreground: 'd19a66', fontStyle: 'bold' },
        { token: 'delimiter.parenthesis', foreground: 'd19a66', fontStyle: 'bold' },
        { token: 'delimiter.square', foreground: 'd19a66', fontStyle: 'bold' },
        { token: 'delimiter.curly', foreground: 'd19a66', fontStyle: 'bold' },
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#383E4A',
        'editor.selectionBackground': '#3E4451',
        'editor.findMatchBackground': '#42557B',
        'editor.findMatchHighlightBackground': '#314365',
        'editorCursor.foreground': '#f8f8f0',
        'editorWhitespace.foreground': '#484a50',
        'editorIndentGuide.background': '#3B4048',
        'editorLineNumber.foreground': '#495162',
        'editorHoverWidget.background': '#21252B',
        'editorHoverWidget.border': '#181A1F',
        'editorSuggestWidget.background': '#21252B',
        'editorSuggestWidget.border': '#181A1F',
        'editorSuggestWidget.selectedBackground': '#2c313a',
        'input.background': '#1d1f23',
        'scrollbarSlider.background': '#4E566680',
        'scrollbarSlider.hoverBackground': '#5A637580',
        'scrollbarSlider.activeBackground': '#747D9180',
        'statusBar.background': '#21252B',
        'statusBar.foreground': '#9da5b4',
        'statusBarItem.hoverBackground': '#2c313a',
        'sideBar.background': '#21252b',
        'sideBarSectionHeader.background': '#282c34',
        'list.activeSelectionBackground': '#2c313a',
        'list.activeSelectionForeground': '#d7dae0',
        'list.focusBackground': '#383E4A',
        'list.hoverBackground': '#292d35',
        'notificationCenter.border': '#181A1F',
        'notificationCenterHeader.foreground': '#abb2bf',
        'notificationCenterHeader.background': '#21252b',
        'notifications.foreground': '#abb2bf',
        'notifications.background': '#21252b',
        'notifications.border': '#181A1F',
      }
    });

    // Set the theme
    monaco.editor.setTheme('one-monokai');

    // Set up content change listener to update height
    editor.onDidContentSizeChange(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        const contentHeight = Math.min(1000, editor.getContentHeight());
        editor.layout({ height: contentHeight, width: editor.getLayoutInfo().width });
      }, 100);
    });

    // Set up scroll listener
    editor.onDidScrollChange((e) => {
        if (onScroll) {
            onScroll(e.scrollTop);
        }
    });

    // Disable the editor's built-in scrolling
    const editorDomNode = editor.getDomNode();
    editorDomNode.style.overflow = 'hidden';

    // Add our custom scroll handler to the wrapper
    wrapperRef.current.addEventListener('wheel', handleScroll, { passive: false });
  };

  const handleScroll = (event) => {
        event.preventDefault();
        const { deltaY } = event;
        const editor = editorRef.current;
        const scrollable = editor.getScrollable();
        const scrollTop = scrollable.getScrollTop();
        const scrollHeight = scrollable.getScrollHeight();
        const clientHeight = editor.getLayoutInfo().height;

        const isScrollingUp = deltaY < 0;
        const isScrollingDown = deltaY > 0;

        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
            // We're at the limit, so propagate the event to the parent
            const parentElement = wrapperRef.current.parentElement;
            const wheelEvent = new WheelEvent('wheel', {
                deltaY: deltaY,
                bubbles: true,
                cancelable: true
            });
            parentElement.dispatchEvent(wheelEvent);
        } else {
            // We're within the editor content, so scroll the editor
            scrollable.setScrollTop(scrollTop + deltaY);
        }
  };

  useEffect(() => {
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);

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
    <EditorWrapper ref={wrapperRef}>
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
    </EditorWrapper>
  );
});

export default MonacoEditor;
