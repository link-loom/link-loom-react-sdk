import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import {
  NotesOutlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  Looks3Outlined,
  FormatListBulletedOutlined,
  FormatListNumberedOutlined,
  CheckBoxOutlined,
  FormatQuoteOutlined,
  CodeOutlined,
} from '@mui/icons-material';

const CONVERTIBLE_NODES = ['paragraph', 'heading', 'bulletList', 'orderedList', 'taskList', 'blockquote', 'codeBlock'];

// Block types offered by "Turn into" (block menu) and the selection toolbar dropdown. Labels come from
// the editor `labels` (see BLOCK_ACTION_LABELS) by `id`.
export const BLOCK_TYPES = [
  { id: 'text', icon: NotesOutlined, apply: (chain) => chain, isActive: (editor) => editor.isActive('paragraph') },
  { id: 'heading1', icon: LooksOneOutlined, apply: (chain) => chain.setHeading({ level: 1 }), isActive: (editor) => editor.isActive('heading', { level: 1 }) },
  { id: 'heading2', icon: LooksTwoOutlined, apply: (chain) => chain.setHeading({ level: 2 }), isActive: (editor) => editor.isActive('heading', { level: 2 }) },
  { id: 'heading3', icon: Looks3Outlined, apply: (chain) => chain.setHeading({ level: 3 }), isActive: (editor) => editor.isActive('heading', { level: 3 }) },
  { id: 'bulletList', icon: FormatListBulletedOutlined, apply: (chain) => chain.toggleBulletList(), isActive: (editor) => editor.isActive('bulletList') },
  { id: 'orderedList', icon: FormatListNumberedOutlined, apply: (chain) => chain.toggleOrderedList(), isActive: (editor) => editor.isActive('orderedList') },
  { id: 'taskList', icon: CheckBoxOutlined, apply: (chain) => chain.toggleTaskList(), isActive: (editor) => editor.isActive('taskList') },
  { id: 'quote', icon: FormatQuoteOutlined, apply: (chain) => chain.toggleBlockquote(), isActive: (editor) => editor.isActive('blockquote') },
  { id: 'codeBlock', icon: CodeOutlined, apply: (chain) => chain.toggleCodeBlock(), isActive: (editor) => editor.isActive('codeBlock') },
];

// Wrappers first: a paragraph inside a list or quote reports the wrapper type.
const ACTIVE_PRIORITY = ['codeBlock', 'taskList', 'bulletList', 'orderedList', 'quote', 'heading1', 'heading2', 'heading3', 'text'];

export const activeBlockType = (editor) =>
  ACTIVE_PRIORITY.map((id) => BLOCK_TYPES.find((type) => type.id === id)).find((type) => type.isActive(editor)) ||
  BLOCK_TYPES[0];

export const availableBlockTypes = (editor) =>
  BLOCK_TYPES.filter((type) => {
    if (type.id === 'taskList') {
      return typeof editor.commands.toggleTaskList === 'function';
    }
    if (type.id === 'codeBlock') {
      return typeof editor.commands.toggleCodeBlock === 'function';
    }
    return true;
  });

// Converts the current selection: wrappers (lists, quotes) are lifted to paragraphs first.
export const applyBlockType = (editor, typeId) => {
  const type = BLOCK_TYPES.find((candidate) => candidate.id === typeId);
  if (!type) {
    return false;
  }
  return type.apply(editor.chain().focus().clearNodes()).run();
};

export const blockStartOf = (doc, index) => {
  let position = 0;
  for (let childIndex = 0; childIndex < index; childIndex += 1) {
    position += doc.child(childIndex).nodeSize;
  }
  return position;
};

const blockAt = (editor, index) => {
  const { doc } = editor.state;
  if (index < 0 || index >= doc.childCount) {
    return null;
  }
  const node = doc.child(index);
  const start = blockStartOf(doc, index);
  return { node, start, end: start + node.nodeSize };
};

export const canTurnBlockInto = (editor, index) => {
  const block = blockAt(editor, index);
  return Boolean(block && CONVERTIBLE_NODES.includes(block.node.type.name));
};

export const turnBlockInto = (editor, index, typeId) => {
  const block = blockAt(editor, index);
  if (!block || !canTurnBlockInto(editor, index)) {
    return false;
  }

  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setSelection(TextSelection.between(tr.doc.resolve(block.start + 1), tr.doc.resolve(block.end - 1)));
      return true;
    })
    .run();
  return applyBlockType(editor, typeId);
};

export const duplicateBlock = (editor, index) => {
  const block = blockAt(editor, index);
  if (!block) {
    return false;
  }
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.insert(block.end, block.node.copy(block.node.content));
      tr.setSelection(TextSelection.near(tr.doc.resolve(block.end + 1)));
      return true;
    })
    .run();
};

export const deleteBlock = (editor, index) => {
  const block = blockAt(editor, index);
  if (!block) {
    return false;
  }
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.delete(block.start, block.end);
      tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(block.start, tr.doc.content.size))));
      return true;
    })
    .run();
};

// "+" in the gutter: an empty paragraph block receives "/" in place; otherwise a new paragraph below
// gets it. The "/" opens the slash menu at that line.
export const insertBlockBelow = (editor, index) => {
  const block = blockAt(editor, index);
  if (!block) {
    return false;
  }
  const isEmptyParagraph = block.node.type.name === 'paragraph' && block.node.content.size === 0;

  return editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      if (isEmptyParagraph) {
        tr.setSelection(TextSelection.create(tr.doc, block.start + 1));
      } else {
        tr.insert(block.end, state.schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.create(tr.doc, block.end + 1));
      }
      tr.insertText('/');
      return true;
    })
    .run();
};

export const selectBlock = (view, index) => {
  const { doc } = view.state;
  view.dispatch(view.state.tr.setSelection(NodeSelection.create(doc, blockStartOf(doc, index))));
};
