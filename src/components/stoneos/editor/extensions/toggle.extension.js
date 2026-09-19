import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { insertBlocks } from './insert-block.js';

export const ToggleSummary = Node.create({
  name: 'toggleSummary',
  content: 'inline*',
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes, { class: 'stos-toggle__summary' }), 0];
  },

  addNodeView() {
    return () => {
      const dom = document.createElement('div');
      dom.className = 'stos-toggle__summary';
      return { dom, contentDOM: dom };
    };
  },
});

export const ToggleContent = Node.create({
  name: 'toggleContent',
  content: 'block+',
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div[data-toggle-content]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-toggle-content': 'true', class: 'stos-toggle__content' }), 0];
  },
});

export const Toggle = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'toggleSummary toggleContent',
  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => (attributes.open ? { open: 'open' } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'details' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { 'data-toggle': 'true', class: 'stos-toggle' }), 0];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const dom = document.createElement('div');
      dom.className = 'stos-toggle';
      dom.setAttribute('data-toggle', 'true');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stos-toggle__button';
      button.contentEditable = 'false';
      button.tabIndex = -1;

      const body = document.createElement('div');
      body.className = 'stos-toggle__body';

      const sync = () => {
        dom.setAttribute('data-open', currentNode.attrs.open ? 'true' : 'false');
        button.setAttribute('aria-expanded', currentNode.attrs.open ? 'true' : 'false');
      };

      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        if (typeof getPos !== 'function') {
          return;
        }
        const position = getPos();
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(position, undefined, {
            ...currentNode.attrs,
            open: !currentNode.attrs.open,
          }),
        );
      });

      dom.append(button, body);
      sync();

      return {
        dom,
        contentDOM: body,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          sync();
          return true;
        },
        ignoreMutation: (mutation) => mutation.type === 'attributes' && mutation.target === dom,
      };
    };
  },

  addCommands() {
    return {
      setToggle:
        () =>
        (props) =>
          insertBlocks(props, [
            {
              type: this.name,
              attrs: { open: true },
              content: [
                { type: 'toggleSummary' },
                { type: 'toggleContent', content: [{ type: 'paragraph' }] },
              ],
            },
          ], { cursorOffset: 2 }),
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter in the summary opens the toggle and moves into its content.
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty || $from.parent.type.name !== 'toggleSummary') {
          return false;
        }

        const toggleDepth = $from.depth - 1;
        const togglePosition = $from.before(toggleDepth);
        const toggleNode = $from.node(toggleDepth);
        const contentStart = $from.after($from.depth) + 2;

        const transaction = editor.state.tr.setNodeMarkup(togglePosition, undefined, {
          ...toggleNode.attrs,
          open: true,
        });
        transaction.setSelection(TextSelection.near(transaction.doc.resolve(contentStart)));
        editor.view.dispatch(transaction.scrollIntoView());
        return true;
      },
    };
  },
});

export default Toggle;
