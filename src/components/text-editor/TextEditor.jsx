import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

function TextEditor({ id, modelraw, onModelChange, index }) {
  const encodedInitialValue = decodeURIComponent(modelraw || '');
  const modelrawRef = useRef(encodedInitialValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link,
    ],
    content: encodedInitialValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const data = {
        model: encodeURIComponent(html),
        modelText: editor.getText(),
        index,
      };
      if (onModelChange) {
        onModelChange(data);
      }
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
    <section className="editor-container">
      <EditorContent id={id} editor={editor} className="content-input text-editor" />
    </section>
  );
}

export default TextEditor;
