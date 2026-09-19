import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { FontFamily } from './extensions/font-family.extension.js';
import { FontSize } from './extensions/font-size.extension.js';
import { LineHeight } from './extensions/line-height.extension.js';
import { ParagraphSpacing } from './extensions/paragraph-spacing.extension.js';
import { Indent } from './extensions/indent.extension.js';
import { PageBreak } from './extensions/page-break.extension.js';
import { Toggle, ToggleSummary, ToggleContent } from './extensions/toggle.extension.js';
import { Callout } from './extensions/callout.extension.js';
import { MergeField } from './extensions/merge-field.extension.js';
import { DocumentStyles } from './extensions/document-styles.extension.js';
import { TableOfContents } from './extensions/table-of-contents.extension.js';
import { SearchReplace } from './extensions/search-replace.extension.js';
import { DocumentImage, ImageUpload } from './extensions/image.extension.js';
import { SlashCommand } from './extensions/slash-command/slash-command.extension.js';
import { BlockDragHandle } from './extensions/block-drag-handle.extension.js';
import { ParagraphStyle } from './extensions/paragraph-style.extension.js';
import { DocumentTable } from './extensions/document-table.extension.js';
import { LinkShortcut } from './extensions/link-shortcut.extension.js';
import { MarkdownPaste } from './extensions/markdown-paste.extension.js';

export const EDITOR_PROFILES = ['notes', 'document', 'slide-text'];

const BLOCK_TYPES = ['paragraph', 'heading'];

const linkExtension = () =>
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: 'https',
    protocols: ['http', 'https', 'mailto', 'tel'],
    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
  });

const placeholderExtension = (placeholder) =>
  Placeholder.configure({ placeholder: placeholder || '', showOnlyCurrent: true, includeChildren: false });

const dropcursorExtension = () => Dropcursor.configure({ color: 'var(--stos-brand, #3c4876)', width: 2 });

const textMarkExtensions = () => [
  Underline,
  Subscript,
  Superscript,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
];

const imageExtensions = (uploadImage, resolveStorageUrl) => [
  DocumentImage.configure({ inline: false, allowBase64: true }),
  ImageUpload.configure({ uploadImage: uploadImage || null, resolveStorageUrl: resolveStorageUrl || null }),
];

const taskExtensions = () => [TaskList, TaskItem.configure({ nested: true })];

const tableExtensions = ({ resizable }) => [
  DocumentTable.configure({ resizable, allowTableNodeSelection: true, HTMLAttributes: { class: 'stos-table' } }),
  TableRow,
  TableHeader,
  TableCell,
];

const createNotesExtensions = ({ placeholder, uploadImage, resolveStorageUrl, labels }) => [
  StarterKit.configure({ heading: { levels: [1, 2, 3] }, dropcursor: false }),
  dropcursorExtension(),
  placeholderExtension(placeholder),
  Underline,
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  Typography,
  linkExtension(),
  LinkShortcut,
  ...taskExtensions(),
  Toggle,
  ToggleSummary,
  ToggleContent,
  Callout,
  ...imageExtensions(uploadImage, resolveStorageUrl),
  ...tableExtensions({ resizable: false }),
  SearchReplace,
  SlashCommand.configure({ labels }),
  BlockDragHandle,
];

const createDocumentExtensions = ({ placeholder, uploadImage, resolveStorageUrl, mergeFields, labels }) => [
  StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, dropcursor: false }),
  dropcursorExtension(),
  placeholderExtension(placeholder),
  ...textMarkExtensions(),
  TextAlign.configure({ types: BLOCK_TYPES }),
  LineHeight.configure({ types: BLOCK_TYPES }),
  ParagraphSpacing.configure({ types: BLOCK_TYPES }),
  Indent.configure({ types: BLOCK_TYPES }),
  Typography,
  linkExtension(),
  LinkShortcut,
  ...taskExtensions(),
  Toggle,
  ToggleSummary,
  ToggleContent,
  Callout,
  PageBreak,
  ...imageExtensions(uploadImage, resolveStorageUrl),
  ...tableExtensions({ resizable: true }),
  MergeField.configure({ fields: Array.isArray(mergeFields) ? mergeFields : [] }),
  TableOfContents,
  ParagraphStyle,
  DocumentStyles,
  CharacterCount,
  SearchReplace,
  SlashCommand.configure({ labels }),
  BlockDragHandle,
  MarkdownPaste,
];

const createSlideTextExtensions = ({ placeholder }) => [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
    dropcursor: false,
  }),
  placeholderExtension(placeholder),
  ...textMarkExtensions(),
  TextAlign.configure({ types: ['paragraph'] }),
];

// `labels` overrides the slash menu copy (see SLASH_COMMAND_LABELS).
export const createEditorExtensions = ({
  profile = 'document',
  placeholder,
  uploadImage,
  resolveStorageUrl,
  mergeFields,
  labels = {},
} = {}) => {
  if (profile === 'notes') {
    return createNotesExtensions({ placeholder, uploadImage, resolveStorageUrl, labels });
  }

  if (profile === 'slide-text') {
    return createSlideTextExtensions({ placeholder });
  }

  return createDocumentExtensions({ placeholder, uploadImage, resolveStorageUrl, mergeFields, labels });
};

export default createEditorExtensions;
