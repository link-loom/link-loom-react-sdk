import { mergeAttributes, Node } from '@tiptap/react';

export const CommandChip = Node.create({
  name: 'commandChip',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-label') || '',
        renderHTML: (attrs) => ({ 'data-label': attrs.label }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="command-chip"]',
        getAttrs: (el) => ({ label: el.getAttribute('data-label') || (el.textContent || '').trim() }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'command-chip', class: 'command-chip' },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      node.attrs.label || '',
    ];
  },

  addCommands() {
    return {
      insertCommandChip:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { label: attrs.label || '' },
          });
        },
    };
  },
});

export default CommandChip;
