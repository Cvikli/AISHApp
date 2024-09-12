import { useEffect, useRef } from 'react';
import { defineMonacoTheme } from '../utils/monacoTheme';

export const useMonacoEditor = (onChange, onScroll) => {
  const editorRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    defineMonacoTheme(monaco);
    monaco.editor.setTheme('one-monokai');

    const editorDomNode = editor.getDomNode();
    editorDomNode.style.overflow = 'hidden';
  };

  return { editorRef, handleEditorDidMount };
};
