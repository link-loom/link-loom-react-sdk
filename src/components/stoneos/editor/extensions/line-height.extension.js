import { Extension } from '@tiptap/core';
import { updateBlocksInSelection } from './block-attributes.js';

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return { types: ['paragraph', 'heading'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        (props) =>
          updateBlocksInSelection(props, this.options.types, () => ({
            lineHeight: lineHeight ? String(lineHeight) : null,
          })),
      unsetLineHeight:
        () =>
        (props) =>
          updateBlocksInSelection(props, this.options.types, () => ({ lineHeight: null })),
    };
  },
});

export default LineHeight;
