import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContext, EditorContent } from '@tiptap/react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

function TextEditor({ id, modelraw, onModelChange, index }) {
  const decodedInitialValue = decodeURIComponent(modelraw || '');
  const modelrawRef = useRef(decodedInitialValue);
  const [editorInstance, setEditorInstance] = useState(null);

  const editor = useEditor({
    content: decodedInitialValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const data = {
        model: encodeURIComponent(html),
        modelText: editor.getText(),
        index,
      };
      onModelChange?.(data);
    },
    onCreate: ({ editor }) => {
      setEditorInstance(editor);
    },
  });

  useEffect(() => {
    const decoded = decodeURIComponent(modelraw || '');
    if (editor && decoded !== modelrawRef.current) {
      modelrawRef.current = decoded;
      if (editor.getHTML() !== decoded) {
        editor.commands.setContent(decoded, false);
      }
    }
  }, [modelraw, editor]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={{ editor }}>
      <SimpleEditor editor={editor} id={id} />
    </EditorContext.Provider>
  );
}

export default TextEditor;
