import { Node, mergeAttributes } from '@tiptap/core';
import { insertBlocks } from './insert-block.js';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true', class: 'stos-page-break' })];
  },

  renderText() {
    return '\n';
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        (props) =>
          insertBlocks(props, [{ type: this.name }]),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
    };
  },
});

export default PageBreak;
