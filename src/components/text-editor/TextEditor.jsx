import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';

import { Button } from '@/components/tiptap-ui-primitive/button';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar';
import { MarkButton } from '@/components/tiptap-ui/mark-button';

function TextEditor({ id, modelraw, onModelChange, index }) {
  const encodedInitialValue = decodeURIComponent(modelraw || '');
  const modelrawRef = useRef(encodedInitialValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link,
      TaskList,
      TaskItem,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      Image,
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
    <EditorContext.Provider value={{ editor }}>
      <section className="editor-container">
        <Toolbar>
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="underline" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="subscript" />
            <MarkButton type="superscript" />
          </ToolbarGroup>
        </Toolbar>
        <EditorContent id={id} editor={editor} className="content-input text-editor" />
      </section>
    </EditorContext.Provider>
  );
}

export default TextEditor;
