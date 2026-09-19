import { Extension } from '@tiptap/core';

// Numbers are points; strings are kept as CSS lengths ('14px', '1.2em').
export const normalizeFontSize = (size) => {
  if (size === null || size === undefined || size === '') {
    return null;
  }

  if (typeof size === 'number' || /^\d+(\.\d+)?$/.test(String(size))) {
    return `${size}pt`;
  }

  return String(size);
};

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: normalizeFontSize(size) }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default FontSize;
