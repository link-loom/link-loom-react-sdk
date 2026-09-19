import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';

const MERGE_FIELD_NAME = /^[A-Za-z_][\w.]*$/;

export const MergeField = Node.create({
  name: 'mergeField',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return { fields: [] };
  },

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-merge-field') || '',
        renderHTML: (attributes) => ({ 'data-merge-field': attributes.name }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => (attributes.label ? { 'data-label': attributes.label, title: attributes.label } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-merge-field]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'stos-merge-field' }), `{{${node.attrs.name}}}`];
  },

  renderText({ node }) {
    return `{{${node.attrs.name}}}`;
  },

  addCommands() {
    return {
      insertMergeField:
        ({ name, label } = {}) =>
        ({ commands }) => {
          if (!name || !MERGE_FIELD_NAME.test(name)) {
            return false;
          }
          return commands.insertContent({ type: this.name, attrs: { name, label: label || null } });
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\{\{[A-Za-z_][\w.]*\}\}$/,
        type: this.type,
        getAttributes: (match) => {
          const name = match[0].slice(2, -2);
          const field = this.options.fields.find((candidate) => candidate.name === name);
          return { name, label: field?.label || null };
        },
      }),
    ];
  },
});

export default MergeField;
