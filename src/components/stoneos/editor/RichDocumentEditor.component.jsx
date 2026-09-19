import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import injectStyleSheet from '../theme/injectStyleSheet.js';
import { createEditorExtensions } from './createEditorExtensions.js';
import { sanitizeDocumentHtml } from './sanitizeDocumentHtml.js';
import { DOCUMENT_STYLES_META } from './extensions/document-styles.extension.js';
import { resolvePendingImages } from './extensions/image.extension.js';
import { mmToPx, resolvePageLayout } from './pageLayout.js';
import { EDITOR_LABELS } from './editorLabels.js';
import BlockGutter from './BlockGutter.component.jsx';
import SelectionToolbar from './SelectionToolbar.component.jsx';
import documentCss from './document.css?raw';
import editorCss from './editor.css?raw';

const EDITOR_STYLES_ATTRIBUTE = 'data-stos-editor';
const CHANGE_DEBOUNCE_MS = 150;

const createScopeId = () => `stos-doc-${Math.random().toString(36).slice(2, 10)}`;

const readEditorValue = (editor) => ({ html: editor.getHTML(), json: editor.getJSON(), text: editor.getText() });

const clampZoom = (zoom) => (Number.isFinite(Number(zoom)) && Number(zoom) > 0 ? Number(zoom) : 1);

// Rendered-to-layout ratio of the sheet: the `zoom` prop and any transform a host applies to an ancestor.
const measureScale = (sheet) => {
  const scale = sheet.offsetWidth ? sheet.getBoundingClientRect().width / sheet.offsetWidth : 1;
  return scale > 0 ? scale : 1;
};

// Page-break nodes grow to reach the next page's content area; the sheet grows by whole pages.
// The content element stretches to the sheet, so the page count follows its last block instead.
// Positions are measured on screen and divided by the scale, so pagination is independent of zoom.
const measurePages = ({ sheet, content, layout }) => {
  const pageHeight = mmToPx(layout.height);
  const marginTop = mmToPx(layout.margins.top);
  const marginBottom = mmToPx(layout.margins.bottom);
  const scale = measureScale(sheet);
  const sheetTop = sheet.getBoundingClientRect().top;
  const layoutOffset = (element, edge) => (element.getBoundingClientRect()[edge] - sheetTop) / scale;
  const breaks = Array.from(content.querySelectorAll('.stos-page-break'));

  breaks.forEach((element) => element.style.removeProperty('--stos-page-fill'));
  breaks.forEach((element) => {
    const offset = layoutOffset(element, 'top');
    const nextContentStart = (Math.floor(offset / pageHeight) + 1) * pageHeight + marginTop;
    element.style.setProperty('--stos-page-fill', `${Math.max(nextContentStart - offset, 0)}px`);
  });

  const lastBlock = content.lastElementChild || content;
  const contentBottom = layoutOffset(lastBlock, 'bottom') + marginBottom;
  return Math.max(1, Math.ceil((contentBottom - 1) / pageHeight));
};

function RichDocumentEditor({
  value = '',
  onChange,
  profile = 'document',
  editable = true,
  placeholder,
  uploadImage,
  resolveStorageUrl,
  resolvePendingUpload,
  onUploadSynced,
  mergeFields,
  onEditorReady,
  className,
  autofocus = false,
  pageLayout = null,
  zoom = 1,
  labels,
  selectionToolbar,
}) {
  // -----------------------------------------------------
  // 1. Refs / State
  // -----------------------------------------------------
  const onChangeRef = useRef(onChange);
  const uploadImageRef = useRef(uploadImage);
  const resolvePendingUploadRef = useRef(resolvePendingUpload);
  const resolveStorageUrlRef = useRef(resolveStorageUrl);
  const lastEmittedHtmlRef = useRef(value);
  const debounceRef = useRef(null);
  const sheetRef = useRef(null);
  const scopeIdRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [documentStylesCss, setDocumentStylesCss] = useState('');
  const [chromeReady, setChromeReady] = useState(false);

  if (!scopeIdRef.current) {
    scopeIdRef.current = createScopeId();
  }

  onChangeRef.current = onChange;
  uploadImageRef.current = uploadImage;
  resolvePendingUploadRef.current = resolvePendingUpload;
  resolveStorageUrlRef.current = resolveStorageUrl;

  // -----------------------------------------------------
  // 2. Editor
  // -----------------------------------------------------
  const resolvedLabels = { ...EDITOR_LABELS, ...labels };
  const resolvedPlaceholder = placeholder ?? (profile === 'notes' ? resolvedLabels.slashPlaceholder : undefined);
  const extensions = useMemo(
    () =>
      createEditorExtensions({
        profile,
        placeholder: resolvedPlaceholder,
        mergeFields,
        labels,
        uploadImage: uploadImage ? (file) => uploadImageRef.current(file) : null,
        resolveStorageUrl: (storageId) => resolveStorageUrlRef.current?.(storageId) ?? null,
      }),
    // Extensions are created once per profile; later prop changes flow through refs.
    [profile],
  );

  const flushChange = (editor) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    if (!onChangeRef.current || editor.isDestroyed) {
      return;
    }
    const nextValue = readEditorValue(editor);
    lastEmittedHtmlRef.current = nextValue.html;
    onChangeRef.current(nextValue);
  };

  const editor = useEditor(
    {
      extensions,
      content: sanitizeDocumentHtml(value, { profile }),
      editable,
      autofocus,
      editorProps: {
        attributes: { class: 'stos-doc__content' },
        transformPastedHTML: (html) => sanitizeDocumentHtml(html, { profile }),
      },
      onUpdate: ({ editor: currentEditor }) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => flushChange(currentEditor), CHANGE_DEBOUNCE_MS);
      },
      onTransaction: ({ editor: currentEditor, transaction }) => {
        if (!transaction.getMeta(DOCUMENT_STYLES_META)) {
          return;
        }
        setDocumentStylesCss(
          currentEditor.storage.documentStyles.getDocumentStylesCss(`.stos-doc[data-stos-doc='${scopeIdRef.current}']`),
        );
      },
    },
    [extensions],
  );

  // -----------------------------------------------------
  // 3. Derived
  // -----------------------------------------------------
  const layout = pageLayout ? resolvePageLayout(pageLayout) : null;
  const zoomFactor = clampZoom(zoom);
  const showSelectionToolbar = selectionToolbar ?? profile === 'notes';

  // -----------------------------------------------------
  // 4. Component Functions
  // -----------------------------------------------------
  // Clicks on the sheet margins below the content land at the end of the document.
  const handleSheetMouseDown = (event) => {
    if (!editor || editor.isDestroyed || !editor.isEditable || event.target !== sheetRef.current) {
      return;
    }
    if (event.clientY < editor.view.dom.getBoundingClientRect().bottom) {
      return;
    }
    event.preventDefault();
    editor.commands.focus('end');
  };

  // -----------------------------------------------------
  // 5. Lifecycle
  // -----------------------------------------------------
  injectStyleSheet(EDITOR_STYLES_ATTRIBUTE, `${documentCss}\n${editorCss}`);

  useEffect(() => {
    if (!editor || !onEditorReady) {
      return;
    }
    onEditorReady(editor);
  }, [editor]);

  // The gutter portals into the editor container, which exists once EditorContent has mounted.
  useEffect(() => {
    setChromeReady(Boolean(editor));
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return undefined;
    }
    return () => {
      if (debounceRef.current) {
        flushChange(editor);
      }
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isEditable === editable) {
      return;
    }
    editor.setEditable(editable, false);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    if (value === lastEmittedHtmlRef.current || value === editor.getHTML()) {
      return;
    }
    lastEmittedHtmlRef.current = value;
    editor.commands.setContent(sanitizeDocumentHtml(value, { profile }), false);
    resolvePendingImages(editor, resolvePendingUploadRef.current);
  }, [editor, value, profile]);

  useEffect(() => {
    if (!editor || !resolvePendingUpload) {
      return undefined;
    }

    const resolve = () => resolvePendingImages(editor, resolvePendingUploadRef.current);
    resolve();
    return typeof onUploadSynced === 'function' ? onUploadSynced(resolve) : undefined;
  }, [editor, Boolean(resolvePendingUpload), onUploadSynced]);

  useLayoutEffect(() => {
    if (!editor || !layout || !sheetRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const content = editor.view.dom;
    let frame = null;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!sheetRef.current || editor.isDestroyed) {
          return;
        }
        setPageCount(measurePages({ sheet: sheetRef.current, content, layout }));
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(content);
    editor.on('update', update);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      editor.off('update', update);
    };
  }, [editor, zoomFactor, layout?.size, layout?.orientation, layout?.width, layout?.height, layout?.margins.top, layout?.margins.bottom]);

  // -----------------------------------------------------
  // 6. Render
  // -----------------------------------------------------
  const documentClassName = ['stos-doc', 'stos-doc-editor', className].filter(Boolean).join(' ');
  const scopedStyles = documentStylesCss ? <style>{documentStylesCss}</style> : null;
  const editorChrome =
    chromeReady && editor && !editor.isDestroyed ? (
      <>
        {editor.storage.blockDragHandle && <BlockGutter editor={editor} labels={resolvedLabels} />}
        {showSelectionToolbar && <SelectionToolbar editor={editor} labels={resolvedLabels} />}
      </>
    ) : null;

  if (!layout) {
    return (
      <>
        {scopedStyles}
        <EditorContent editor={editor} className={documentClassName} data-stos-doc={scopeIdRef.current} data-profile={profile} />
        {editorChrome}
      </>
    );
  }

  const pageHeight = mmToPx(layout.height);
  const sheetStyle = {
    width: `${layout.width}mm`,
    minHeight: `${pageCount * pageHeight}px`,
    padding: `${layout.margins.top}mm ${layout.margins.right}mm ${layout.margins.bottom}mm ${layout.margins.left}mm`,
  };
  // A transform does not change layout size, so the frame reserves the zoomed footprint for scrolling.
  const zoomFrameStyle =
    zoomFactor === 1
      ? undefined
      : { width: `${mmToPx(layout.width) * zoomFactor}px`, height: `${pageCount * pageHeight * zoomFactor}px`, margin: '0 auto' };

  const sheet = (
    <div
      ref={sheetRef}
      className="stos-doc-sheet"
      onMouseDown={handleSheetMouseDown}
      data-page-size={layout.size}
      data-orientation={layout.orientation}
      data-pages={pageCount}
      data-zoom={zoomFactor}
      style={zoomFrameStyle ? { ...sheetStyle, transform: `scale(${zoomFactor})`, transformOrigin: 'top left' } : sheetStyle}
    >
      <EditorContent editor={editor} className={documentClassName} data-stos-doc={scopeIdRef.current} data-profile={profile} />
      {Array.from({ length: pageCount - 1 }, (_, index) => (
        <div
          key={index}
          className="stos-doc-sheet__separator"
          aria-hidden="true"
          style={{ top: `${(index + 1) * pageHeight}px` }}
        />
      ))}
    </div>
  );

  return (
    <div className="stos-doc-canvas">
      {scopedStyles}
      {editorChrome}
      {zoomFrameStyle ? <div style={zoomFrameStyle}>{sheet}</div> : sheet}
    </div>
  );
}

export default RichDocumentEditor;
