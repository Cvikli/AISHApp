import { useEffect, useRef } from 'react';


export const useMonacoEditor = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
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
    monacoRef.current = monaco;

    if (monaco) {

      monaco.editor.setTheme('one-monokai');
    }

    // const editorDomNode = editor.getDomNode();
    // editorDomNode.style.overflow = 'hidden';
  };

  return { editorRef, monacoRef, handleEditorDidMount };
};
