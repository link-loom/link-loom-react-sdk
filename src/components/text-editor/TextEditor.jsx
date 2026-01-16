import React, { useRef, useEffect } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

function TextEditor({ id, modelraw, onModelChange, index, ...props }) {
  const decodedInitialValue = decodeURIComponent(modelraw || '');
  const modelrawRef = useRef(decodedInitialValue);

  // Sync ref with prop changes to handle external updates (e.g. clearing input)
  useEffect(() => {
    const decoded = decodeURIComponent(modelraw || '');
    if (modelrawRef.current !== decoded) {
      modelrawRef.current = decoded;
    }
  }, [modelraw]);

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
      externalContent={decodeURIComponent(modelraw || '')}
      minRows={props.minRows}
      maxRows={props.maxRows}
      toolbarOptions={props.toolbarOptions}
      autoGrow={props.autoGrow}
    />
  );
}

export default TextEditor;
