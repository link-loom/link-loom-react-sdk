import { Extension } from '@tiptap/core';
import { updateBlocksInSelection } from './block-attributes.js';

export const INDENT_STEP_PX = 24;

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return { types: ['paragraph', 'heading'], maxLevel: 8 };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const level = parseInt(element.getAttribute('data-indent'), 10);
              return Number.isNaN(level) ? 0 : Math.min(Math.max(level, 0), this.options.maxLevel);
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) {
                return {};
              }
              return {
                'data-indent': attributes.indent,
                style: `padding-left: ${attributes.indent * INDENT_STEP_PX}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    const shift = (delta) => (props) =>
      updateBlocksInSelection(props, this.options.types, (attributes) => {
        const nextLevel = Math.min(Math.max((attributes.indent || 0) + delta, 0), this.options.maxLevel);
        return nextLevel === attributes.indent ? null : { indent: nextLevel };
      });

    return {
      indent: () => shift(1),
      outdent: () => shift(-1),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-]': () => this.editor.commands.indent(),
      'Mod-[': () => this.editor.commands.outdent(),
    };
  },
});

export default Indent;
