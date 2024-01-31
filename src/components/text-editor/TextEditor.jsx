import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

function TextEditor({ id, modelraw, onModelChange, index }) {
  const [contentEditor, setContentEditor] = useState(null);
  const modelrawRef = useRef(modelraw); // Reference to handle modelraw updates

  useEffect(() => {
    modelrawRef.current = modelraw; // Update the reference
    if (contentEditor) {
      const decodedModelRaw = window.decodeURI(modelrawRef.current);
      if (contentEditor.getContent() !== decodedModelRaw) {
        try {
          contentEditor.setContent(decodedModelRaw);
        } catch (error) {
          console.error('Error decoding content: ', error);
        }
      }
    }
  }, [modelraw]);

  useEffect(() => {
    initializeComponent();

    return () => {
      if (window.tinymce) {
        window.tinymce.remove(`#${id}`);
      }
    };
  }, []);

  const initializeComponent = async () => {
    await initializeEditor(`#${id}`);
    setContentEditor(window.tinymce.activeEditor);
  };

  const initializeEditor = (selector) => {
    return window.tinymce.init({
      selector: selector,
      language: 'es',
      skin: 'fabric',
      content_css: ['fabric', '@assets/libs/tinymce/skins/fabric/fabric.css'],
      toolbar_mode: 'floating',
      plugins:
        'print preview paste importcss searchreplace autolink directionality code visualblocks visualchars fullscreen image link media table charmap hr nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
      menubar: 'file edit view insert format tools table help',
      toolbar:
        'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | charmap emoticons | fullscreen preview print | insertfile image media link anchor | ltr rtl',
      mobile: {
        plugins:
          'print preview importcss searchreplace autolink directionality visualblocks visualchars fullscreen image link media table charmap hr nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern noneditable help charmap quickbars emoticons',
      },
      height: 600,
      image_caption: true,
      quickbars_selection_toolbar:
        'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
      spellchecker_dialog: true,
      spellchecker_whitelist: ['Ephox', 'Moxiecode'],
      tinycomments_mode: 'embedded',
      content_style: '.mymention{ color: gray; }',
      contextmenu: 'link image imagetools',

      init_instance_callback: (editor) => {
        if (modelrawRef.current) {
          try {
            editor.setContent(window.decodeURI(modelrawRef.current));
          } catch (error) {
            console.error('Error decoding content: ', error);
          }
        }
        editor.on('Change', (e) => {
          emitModelChange(e, editor);
        });
      },
    });
  };

  const emitModelChange = (e, editor) => {
    const data = {
      model: window.encodeURI(editor.getContent()),
      modelText: editor.getContent({ format: 'text' }),
      index: index,
    };
    if (onModelChange) {
      onModelChange(data);
    }
  };

  return (
    <section className="editor-container">
      <div id={id} className="content-input text-editor"></div>
    </section>
  );
}

export default TextEditor;
