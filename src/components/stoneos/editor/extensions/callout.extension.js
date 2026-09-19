import { Node, mergeAttributes } from '@tiptap/core';

export const CALLOUT_VARIANTS = ['info', 'success', 'warning', 'danger', 'note'];

const normalizeVariant = (variant) => (CALLOUT_VARIANTS.includes(variant) ? variant : 'info');

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: (element) => normalizeVariant(element.getAttribute('data-callout')),
        renderHTML: (attributes) => ({ 'data-callout': normalizeVariant(attributes.variant) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'stos-callout' }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (variant) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant: normalizeVariant(variant) }),
      toggleCallout:
        (variant) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { variant: normalizeVariant(variant) }),
      setCalloutVariant:
        (variant) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { variant: normalizeVariant(variant) }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

export default Callout;
