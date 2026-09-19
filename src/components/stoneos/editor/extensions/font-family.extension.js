import { Extension } from '@tiptap/core';

// Replaces @tiptap/extension-font-family. Host themes ship blanket rules such as
// `span, strong, h1 { font-family: <system stack> !important }`, which beat a plain inline declaration
// and leave the font the author picked with no effect on screen or in print. The document's own font is
// therefore declared important; the stored attribute stays a clean stack, because `element.style` drops
// the priority when the mark is parsed back and every export reads the attribute.
export const FontFamily = Extension.create({
  name: 'fontFamily',

  addOptions() {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }
              return { style: `font-family: ${attributes.fontFamily} !important` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default FontFamily;
