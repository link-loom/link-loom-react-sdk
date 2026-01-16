import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';

// --- Custom Extensions ---
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/tiptap-ui/color-highlight-popover';
import { LinkPopover, LinkContent, LinkButton } from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';

// --- Hooks ---
import { useMobile } from '@/hooks/use-mobile';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Components ---
import { ThemeToggle } from '@/components/tiptap-templates/simple/theme-toggle';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';
import '@/styles/_variables.scss';
import '@/styles/_keyframe-animations.scss';

import content from '@/components/tiptap-templates/simple/data/content.json';

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile, options }) => {
  const shouldShow = (id) => !options || options.includes(id);

  return (
    <>
      <Spacer />
      {shouldShow('undo') && (
        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>
      )}
      {shouldShow('undo') && <ToolbarSeparator />}

      {(shouldShow('heading') || shouldShow('list') || shouldShow('blockquote') || shouldShow('codeBlock')) && (
        <ToolbarGroup>
          {shouldShow('heading') && <HeadingDropdownMenu levels={[1, 2, 3, 4]} />}
          {shouldShow('list') && <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />}
          {shouldShow('blockquote') && <BlockquoteButton />}
          {shouldShow('codeBlock') && <CodeBlockButton />}
        </ToolbarGroup>
      )}
      {(shouldShow('heading') || shouldShow('list') || shouldShow('blockquote') || shouldShow('codeBlock')) && <ToolbarSeparator />}

      <ToolbarGroup>
        {shouldShow('bold') && <MarkButton type="bold" />}
        {shouldShow('italic') && <MarkButton type="italic" />}
        {shouldShow('strike') && <MarkButton type="strike" />}
        {shouldShow('code') && <MarkButton type="code" />}
        {shouldShow('underline') && <MarkButton type="underline" />}
        {shouldShow('highlight') && (!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        ))}
        {shouldShow('link') && (!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />)}
      </ToolbarGroup>
      <ToolbarSeparator />

      {(shouldShow('superscript') || shouldShow('subscript')) && (
        <ToolbarGroup>
          {shouldShow('superscript') && <MarkButton type="superscript" />}
          {shouldShow('subscript') && <MarkButton type="subscript" />}
        </ToolbarGroup>
      )}
      {(shouldShow('superscript') || shouldShow('subscript')) && <ToolbarSeparator />}

      {shouldShow('align') && (
        <ToolbarGroup>
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </ToolbarGroup>
      )}
      {shouldShow('align') && <ToolbarSeparator />}

      {shouldShow('image') && (
        <ToolbarGroup>
          <ImageUploadButton text="Add" />
        </ToolbarGroup>
      )}

      <Spacer />
      {isMobile && <ToolbarSeparator />}
      {shouldShow('theme') && (
        <ToolbarGroup>
          <ThemeToggle disableAutoDetect />
        </ToolbarGroup>
      )}
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
);

export function SimpleEditor({ id, initialContent, onContentUpdate, modelrawRef, minRows, maxRows, toolbarOptions, autoGrow, externalContent }) {
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState('main');
  const toolbarRef = React.useRef(null);

  const editor = useEditor({
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: content,
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    // Use externalContent if provided (reactive), otherwise fallback to modelrawRef (ref-based)
    const targetContent = typeof externalContent !== 'undefined' ? externalContent : modelrawRef?.current;

    if (targetContent === undefined || targetContent === null) return;

    // Strict clearing check
    if (targetContent === '') {
      editor.commands.setContent('');
      return;
    }

    // General sync
    if (editor.getHTML() !== targetContent) {
      // Only update if significantly different to avoid cursor jumps on minor diffs
      // For clearing validation, check if we need to enforce
      if (targetContent !== modelrawRef.current) {
        // External prop changed, so we respect it
        editor.commands.setContent(targetContent, false);
      }
    }
  }, [editor, externalContent]);

  return (
    <section className={`simple-editor ${autoGrow ? 'auto-grow' : ''}`} id={id}>
      <style>{`
        #${id} .simple-editor-content .tiptap.ProseMirror {
           ${maxRows ? `max-height: ${maxRows * 24}px; overflow-y: auto;` : ''}
           ${minRows ? `min-height: ${minRows * 24}px;` : ''}
        }
      `}</style>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile
              ? {
                bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
              }
              : {}
          }
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
              options={toolbarOptions}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>
        <div className="content-wrapper">
          <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
        </div>
      </EditorContext.Provider>
    </section>
  );
}
