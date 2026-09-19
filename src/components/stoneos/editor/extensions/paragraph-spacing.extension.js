import { Extension } from '@tiptap/core';
import { updateBlocksInSelection } from './block-attributes.js';

const toCssLength = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return typeof value === 'number' ? `${value}pt` : String(value);
};

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addOptions() {
    return { types: ['paragraph', 'heading'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          spaceBefore: {
            default: null,
            parseHTML: (element) => element.style.marginTop || null,
            renderHTML: (attributes) =>
              attributes.spaceBefore ? { style: `margin-top: ${attributes.spaceBefore}` } : {},
          },
          spaceAfter: {
            default: null,
            parseHTML: (element) => element.style.marginBottom || null,
            renderHTML: (attributes) =>
              attributes.spaceAfter ? { style: `margin-bottom: ${attributes.spaceAfter}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      // `before` / `after`: points (number) or CSS length; omitted keys keep their value.
      setParagraphSpacing:
        ({ before, after } = {}) =>
        (props) =>
          updateBlocksInSelection(props, this.options.types, (attributes) => ({
            spaceBefore: before === undefined ? attributes.spaceBefore : toCssLength(before),
            spaceAfter: after === undefined ? attributes.spaceAfter : toCssLength(after),
          })),
      unsetParagraphSpacing:
        () =>
        (props) =>
          updateBlocksInSelection(props, this.options.types, () => ({
            spaceBefore: null,
            spaceAfter: null,
          })),
    };
  },
});

export default ParagraphSpacing;
