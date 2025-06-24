import React, { useRef, useEffect } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

function TextEditor({ id, modelraw, onModelChange, index }) {
  const decodedInitialValue = decodeURIComponent(modelraw || '');
  const modelrawRef = useRef(decodedInitialValue);

  const handleChange = (editor) => {
    const html = editor.getHTML();
    const data = {
      model: encodeURIComponent(html),
      modelText: editor.getText(),
      index,
    };
    onModelChange?.(data);
  };

  return (
    <SimpleEditor
      id={id}
      initialContent={decodedInitialValue}
      onContentUpdate={handleChange}
      modelrawRef={modelrawRef}
    />
  );
}

export default TextEditor;
