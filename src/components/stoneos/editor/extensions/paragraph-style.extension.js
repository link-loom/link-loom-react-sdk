import { Extension } from '@tiptap/core';

// Title and subtitle are paragraphs with a named style, not headings: they never enter the table of
// contents. HTML carries `data-style`; imported DOCX paragraphs arrive with `stos-paragraph-{style}`.
export const PARAGRAPH_STYLES = ['title', 'subtitle'];

const parseParagraphStyle = (element) => {
  const dataStyle = element.getAttribute('data-style');
  if (PARAGRAPH_STYLES.includes(dataStyle)) {
    return dataStyle;
  }
  return PARAGRAPH_STYLES.find((style) => element.classList.contains(`stos-paragraph-${style}`)) || null;
};

export const ParagraphStyle = Extension.create({
  name: 'paragraphStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          docStyle: {
            default: null,
            parseHTML: parseParagraphStyle,
            renderHTML: (attributes) => (attributes.docStyle ? { 'data-style': attributes.docStyle } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      // `style`: 'title' | 'subtitle'; anything else makes the blocks plain paragraphs.
      setParagraphStyle:
        (style) =>
        ({ editor, commands }) => {
          const docStyle = PARAGRAPH_STYLES.includes(style) ? style : null;
          if (editor.isActive('paragraph')) {
            return commands.updateAttributes('paragraph', { docStyle });
          }
          // Block attributes shared with paragraphs (alignment, spacing, indent) survive the conversion.
          const { level, id, ...sharedAttributes } = editor.getAttributes('heading');
          return commands.setNode('paragraph', { ...sharedAttributes, docStyle });
        },
    };
  },
});

export default ParagraphStyle;
