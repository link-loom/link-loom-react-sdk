import { IMAGE_ALIGNMENTS, insertImageFile } from './extensions/image.extension.js';
import { PARAGRAPH_STYLES } from './extensions/paragraph-style.extension.js';

const isReady = (editor) => Boolean(editor && !editor.isDestroyed);

const hasCommands = (editor, names) =>
  isReady(editor) && names.every((name) => typeof editor.commands[name] === 'function');

// Every entry: run(editor, value?), isAvailable(editor), optional isActive(editor) and getValue(editor).
const defineCommand = ({ requires, run, isActive, getValue }) => ({
  isAvailable: (editor) => hasCommands(editor, requires),
  run: (editor, value) => {
    if (!hasCommands(editor, requires)) {
      return false;
    }
    return run(editor, value);
  },
  ...(isActive && { isActive: (editor) => isReady(editor) && Boolean(isActive(editor)) }),
  ...(getValue && { getValue: (editor) => (isReady(editor) ? getValue(editor) : null) }),
});

const chainRun = (editor, build) => build(editor.chain().focus()).run();

const markCommand = (mark, toggleName) =>
  defineCommand({
    requires: [toggleName],
    run: (editor) => chainRun(editor, (chain) => chain[toggleName]()),
    isActive: (editor) => editor.isActive(mark),
  });

const alignCommand = (alignment) =>
  defineCommand({
    requires: ['setTextAlign'],
    run: (editor) => chainRun(editor, (chain) => chain.setTextAlign(alignment)),
    isActive: (editor) => editor.isActive({ textAlign: alignment }),
  });

const tableCommand = (name) =>
  defineCommand({
    requires: [name],
    run: (editor) => chainRun(editor, (chain) => chain[name]()),
  });

const getBlockType = (editor) => {
  for (let level = 1; level <= 6; level += 1) {
    if (editor.isActive('heading', { level })) {
      return `heading${level}`;
    }
  }
  if (editor.isActive('codeBlock')) {
    return 'codeBlock';
  }
  if (editor.isActive('blockquote')) {
    return 'blockquote';
  }
  return editor.getAttributes('paragraph').docStyle || 'paragraph';
};

const getBlockAttribute = (editor, attribute) =>
  editor.getAttributes('paragraph')[attribute] || editor.getAttributes('heading')[attribute] || null;

const isInListItem = (editor) => editor.isActive('listItem') || editor.isActive('taskItem');

const listItemType = (editor) => (editor.isActive('taskItem') ? 'taskItem' : 'listItem');

const blockTypeCommand = defineCommand({
  requires: ['setParagraph'],
  run: (editor, value) => {
    const level = /^heading([1-6])$/.exec(String(value || ''));
    if (level) {
      return chainRun(editor, (chain) => chain.setHeading({ level: Number(level[1]) }));
    }
    if (value === 'codeBlock') {
      return chainRun(editor, (chain) => chain.setCodeBlock());
    }
    if (value === 'blockquote') {
      return chainRun(editor, (chain) => chain.setParagraph().setBlockquote());
    }
    if (PARAGRAPH_STYLES.includes(value)) {
      return hasCommands(editor, ['setParagraphStyle']) && chainRun(editor, (chain) => chain.setParagraphStyle(value));
    }
    if (hasCommands(editor, ['setParagraphStyle'])) {
      return chainRun(editor, (chain) => chain.setParagraphStyle(null));
    }
    return chainRun(editor, (chain) => chain.setParagraph());
  },
  getValue: getBlockType,
});

export const editorCommands = {
  undo: defineCommand({ requires: ['undo'], run: (editor) => chainRun(editor, (chain) => chain.undo()) }),
  redo: defineCommand({ requires: ['redo'], run: (editor) => chainRun(editor, (chain) => chain.redo()) }),

  bold: markCommand('bold', 'toggleBold'),
  italic: markCommand('italic', 'toggleItalic'),
  underline: markCommand('underline', 'toggleUnderline'),
  strike: markCommand('strike', 'toggleStrike'),
  code: markCommand('code', 'toggleCode'),
  subscript: markCommand('subscript', 'toggleSubscript'),
  superscript: markCommand('superscript', 'toggleSuperscript'),

  color: defineCommand({
    requires: ['setColor'],
    run: (editor, value) =>
      chainRun(editor, (chain) => (value ? chain.setColor(value) : chain.unsetColor())),
    isActive: (editor) => Boolean(editor.getAttributes('textStyle').color),
    getValue: (editor) => editor.getAttributes('textStyle').color || null,
  }),
  // Clearing with the caret inside a highlighted run clears the whole run, as Word does.
  highlight: defineCommand({
    requires: ['setHighlight'],
    run: (editor, value) =>
      chainRun(editor, (chain) => {
        if (value) {
          return chain.setHighlight({ color: value });
        }
        return editor.state.selection.empty ? chain.extendMarkRange('highlight').unsetHighlight() : chain.unsetHighlight();
      }),
    isActive: (editor) => editor.isActive('highlight'),
    getValue: (editor) => editor.getAttributes('highlight').color || null,
  }),
  fontFamily: defineCommand({
    requires: ['setFontFamily'],
    run: (editor, value) =>
      chainRun(editor, (chain) => (value ? chain.setFontFamily(value) : chain.unsetFontFamily())),
    getValue: (editor) => editor.getAttributes('textStyle').fontFamily || null,
  }),
  fontSize: defineCommand({
    requires: ['setFontSize'],
    run: (editor, value) => chainRun(editor, (chain) => (value ? chain.setFontSize(value) : chain.unsetFontSize())),
    getValue: (editor) => editor.getAttributes('textStyle').fontSize || null,
  }),
  clearFormatting: defineCommand({
    requires: ['unsetAllMarks'],
    run: (editor) => chainRun(editor, (chain) => chain.unsetAllMarks().clearNodes()),
  }),

  paragraph: defineCommand({
    requires: ['setParagraph'],
    run: (editor) => blockTypeCommand.run(editor, 'paragraph'),
    isActive: (editor) => getBlockType(editor) === 'paragraph',
  }),
  heading: defineCommand({
    requires: ['toggleHeading'],
    run: (editor, value) => chainRun(editor, (chain) => chain.toggleHeading({ level: Number(value) || 1 })),
    isActive: (editor) => editor.isActive('heading'),
    getValue: (editor) => editor.getAttributes('heading').level || null,
  }),
  blockType: blockTypeCommand,
  blockquote: defineCommand({
    requires: ['toggleBlockquote'],
    run: (editor) => chainRun(editor, (chain) => chain.toggleBlockquote()),
    isActive: (editor) => editor.isActive('blockquote'),
  }),
  codeBlock: defineCommand({
    requires: ['toggleCodeBlock'],
    run: (editor) => chainRun(editor, (chain) => chain.toggleCodeBlock()),
    isActive: (editor) => editor.isActive('codeBlock'),
  }),

  bulletList: defineCommand({
    requires: ['toggleBulletList'],
    run: (editor) => chainRun(editor, (chain) => chain.toggleBulletList()),
    isActive: (editor) => editor.isActive('bulletList'),
  }),
  orderedList: defineCommand({
    requires: ['toggleOrderedList'],
    run: (editor) => chainRun(editor, (chain) => chain.toggleOrderedList()),
    isActive: (editor) => editor.isActive('orderedList'),
  }),
  taskList: defineCommand({
    requires: ['toggleTaskList'],
    run: (editor) => chainRun(editor, (chain) => chain.toggleTaskList()),
    isActive: (editor) => editor.isActive('taskList'),
  }),
  indent: defineCommand({
    requires: [],
    run: (editor) => {
      if (isInListItem(editor)) {
        return chainRun(editor, (chain) => chain.sinkListItem(listItemType(editor)));
      }
      return hasCommands(editor, ['indent']) && chainRun(editor, (chain) => chain.indent());
    },
  }),
  outdent: defineCommand({
    requires: [],
    run: (editor) => {
      if (isInListItem(editor)) {
        return chainRun(editor, (chain) => chain.liftListItem(listItemType(editor)));
      }
      return hasCommands(editor, ['outdent']) && chainRun(editor, (chain) => chain.outdent());
    },
  }),

  alignLeft: alignCommand('left'),
  alignCenter: alignCommand('center'),
  alignRight: alignCommand('right'),
  alignJustify: alignCommand('justify'),
  lineHeight: defineCommand({
    requires: ['setLineHeight'],
    run: (editor, value) =>
      chainRun(editor, (chain) => (value ? chain.setLineHeight(value) : chain.unsetLineHeight())),
    getValue: (editor) => getBlockAttribute(editor, 'lineHeight'),
  }),
  // value: { before, after } in points or CSS lengths; null clears both.
  spacing: defineCommand({
    requires: ['setParagraphSpacing'],
    run: (editor, value) =>
      chainRun(editor, (chain) => (value ? chain.setParagraphSpacing(value) : chain.unsetParagraphSpacing())),
    getValue: (editor) => ({
      before: getBlockAttribute(editor, 'spaceBefore'),
      after: getBlockAttribute(editor, 'spaceAfter'),
    }),
  }),

  // value: { rows, cols, withHeaderRow }
  insertTable: defineCommand({
    requires: ['insertTable'],
    run: (editor, value = {}) =>
      chainRun(editor, (chain) =>
        chain.insertTable({
          rows: value.rows || 3,
          cols: value.cols || 3,
          withHeaderRow: value.withHeaderRow !== false,
        }),
      ),
    isActive: (editor) => editor.isActive('table'),
  }),
  addRowBefore: tableCommand('addRowBefore'),
  addRowAfter: tableCommand('addRowAfter'),
  deleteRow: tableCommand('deleteRow'),
  addColumnBefore: tableCommand('addColumnBefore'),
  addColumnAfter: tableCommand('addColumnAfter'),
  deleteColumn: tableCommand('deleteColumn'),
  deleteTable: tableCommand('deleteTable'),
  mergeCells: tableCommand('mergeCells'),
  splitCell: tableCommand('splitCell'),
  mergeOrSplit: tableCommand('mergeOrSplit'),
  toggleHeaderRow: tableCommand('toggleHeaderRow'),
  toggleHeaderColumn: tableCommand('toggleHeaderColumn'),
  // value: 'all' | 'outer' | 'none' | 'horizontal'
  tableBorders: defineCommand({
    requires: ['setTableBorders'],
    run: (editor, value) => chainRun(editor, (chain) => chain.setTableBorders(value)),
    isActive: (editor) => editor.isActive('table'),
    getValue: (editor) => editor.getAttributes('table').border || 'all',
  }),
  // value: 'auto' | 'full' | pixels (number or '480px'); null restores the resized column widths
  tableWidth: defineCommand({
    requires: ['setTableWidth'],
    run: (editor, value) => chainRun(editor, (chain) => chain.setTableWidth(value)),
    isActive: (editor) => editor.isActive('table'),
    getValue: (editor) => editor.getAttributes('table').width || null,
  }),

  // value: File (uploaded through uploadImage) or { src, alt, width, height }
  insertImage: defineCommand({
    requires: ['setImage'],
    run: (editor, value) => {
      if (typeof Blob !== 'undefined' && value instanceof Blob) {
        return insertImageFile(editor, value);
      }
      if (!value?.src && !value?.storageId) {
        return false;
      }
      return chainRun(editor, (chain) => chain.insertContent({ type: 'image', attrs: value }));
    },
  }),
  // value: 'left' | 'center' | 'right' (left/right float with text wrapping); null clears. Applies to the selected image.
  imageAlign: defineCommand({
    requires: ['updateAttributes'],
    run: (editor, value) =>
      editor.isActive('image') &&
      chainRun(editor, (chain) => chain.updateAttributes('image', { align: IMAGE_ALIGNMENTS.includes(value) ? value : null })),
    isActive: (editor) => editor.isActive('image'),
    getValue: (editor) => editor.getAttributes('image').align || null,
  }),
  // value: href string or { href, target }
  setLink: defineCommand({
    requires: ['setLink'],
    run: (editor, value) => {
      const attributes = typeof value === 'string' ? { href: value } : value;
      if (!attributes?.href) {
        return chainRun(editor, (chain) => chain.extendMarkRange('link').unsetLink());
      }
      return chainRun(editor, (chain) => chain.extendMarkRange('link').setLink(attributes));
    },
    isActive: (editor) => editor.isActive('link'),
    getValue: (editor) => editor.getAttributes('link').href || null,
  }),
  unsetLink: defineCommand({
    requires: ['unsetLink'],
    run: (editor) => chainRun(editor, (chain) => chain.extendMarkRange('link').unsetLink()),
  }),

  insertPageBreak: defineCommand({
    requires: ['setPageBreak'],
    run: (editor) => chainRun(editor, (chain) => chain.setPageBreak()),
  }),
  insertHorizontalRule: defineCommand({
    requires: ['setHorizontalRule'],
    run: (editor) => chainRun(editor, (chain) => chain.setHorizontalRule()),
  }),
  // value: 'info' | 'success' | 'warning' | 'danger' | 'note'
  insertCallout: defineCommand({
    requires: ['setCallout'],
    run: (editor, value) => {
      if (editor.isActive('callout')) {
        return chainRun(editor, (chain) => chain.setCalloutVariant(value));
      }
      return chainRun(editor, (chain) => chain.setCallout(value));
    },
    isActive: (editor) => editor.isActive('callout'),
    getValue: (editor) => editor.getAttributes('callout').variant || null,
  }),
  insertToggle: defineCommand({
    requires: ['setToggle'],
    run: (editor) => chainRun(editor, (chain) => chain.setToggle()),
  }),
  // value: { name, label }
  insertMergeField: defineCommand({
    requires: ['insertMergeField'],
    run: (editor, value) => chainRun(editor, (chain) => chain.insertMergeField(value || {})),
  }),
  insertToc: defineCommand({
    requires: ['insertTableOfContents'],
    run: (editor) => chainRun(editor, (chain) => chain.insertTableOfContents()),
  }),

  // value: search term. getValue → { term, replaceTerm, caseSensitive, count, index }
  find: defineCommand({
    requires: ['setSearchTerm'],
    run: (editor, value) => editor.commands.setSearchTerm(value),
    getValue: (editor) => {
      const storage = editor.storage.searchReplace;
      return {
        term: storage.searchTerm,
        replaceTerm: storage.replaceTerm,
        caseSensitive: storage.caseSensitive,
        count: storage.results.length,
        index: storage.results.length ? storage.index : -1,
      };
    },
  }),
  findCaseSensitive: defineCommand({
    requires: ['setSearchCaseSensitive'],
    run: (editor, value) => editor.commands.setSearchCaseSensitive(value),
    isActive: (editor) => editor.storage.searchReplace.caseSensitive,
  }),
  findNext: defineCommand({ requires: ['nextSearchResult'], run: (editor) => editor.commands.nextSearchResult() }),
  findPrevious: defineCommand({
    requires: ['previousSearchResult'],
    run: (editor) => editor.commands.previousSearchResult(),
  }),
  // value: replacement text (omit to reuse the last one)
  replace: defineCommand({
    requires: ['replace'],
    run: (editor, value) => {
      if (value !== undefined) {
        editor.commands.setReplaceTerm(value);
      }
      return editor.commands.replace();
    },
  }),
  replaceAll: defineCommand({
    requires: ['replaceAll'],
    run: (editor, value) => {
      if (value !== undefined) {
        editor.commands.setReplaceTerm(value);
      }
      return editor.commands.replaceAll();
    },
  }),

  // value: { name, css }
  setDocumentStyle: defineCommand({
    requires: ['setDocumentStyle'],
    run: (editor, value) => editor.commands.setDocumentStyle(value?.name, value?.css),
    getValue: (editor) => editor.storage.documentStyles.getDocumentStylesCss(),
  }),
};

export const EDITOR_COMMAND_IDS = Object.keys(editorCommands);

export default editorCommands;
