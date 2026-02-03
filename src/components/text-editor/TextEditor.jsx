import React, { useRef, useEffect } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

import { serializeToMarkdown } from '@/lib/markdown-serializer';

function TextEditor({
  id,
  modelraw,
  onModelChange,
  index,
  outputFormat = 'html',
  autoFocus,
  ...props
}) {
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
    let content;

    if (outputFormat === 'markdown') {
      const json = editor.getJSON();
      content = serializeToMarkdown(json);
    } else {
      content = editor.getHTML();
    }

    const data = {
      model: encodeURIComponent(content),
      modelText: editor.getText(),
      json: editor.getJSON(),
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
      autoFocus={autoFocus}
    />
  );
}

export default TextEditor;
