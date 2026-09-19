import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { insertBlocks } from './insert-block.js';

const tableOfContentsKey = new PluginKey('stosTableOfContents');

const TOC_SYNC_META = 'stosTableOfContentsSync';

const createHeadingId = () => `h-${Math.random().toString(36).slice(2, 10)}`;

const collectHeadings = (doc) => {
  const headings = [];
  doc.descendants((node) => {
    if (node.type.name === 'heading' && node.textContent.trim()) {
      headings.push({ id: node.attrs.id, level: node.attrs.level, text: node.textContent });
    }
    return node.isBlock;
  });
  return headings;
};

const parseItems = (element) =>
  Array.from(element.querySelectorAll('a[data-toc-link]')).map((link) => ({
    id: (link.getAttribute('href') || '').replace(/^#/, ''),
    level: parseInt(link.getAttribute('data-level'), 10) || 1,
    text: link.textContent || '',
  }));

export const TableOfContents = Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  selectable: true,

  addOptions() {
    return { maxLevel: 3 };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute('id'),
            renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {}),
          },
        },
      },
    ];
  },

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: parseItems,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'nav[data-toc]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = (node.attrs.items || []).filter((item) => item.level <= this.options.maxLevel);
    const list = items.length
      ? [
          'ol',
          {},
          ...items.map((item) => [
            'li',
            { 'data-level': String(item.level) },
            ['a', { href: `#${item.id}`, 'data-toc-link': 'true', 'data-level': String(item.level) }, item.text],
          ]),
        ]
      : ['ol', {}];

    return ['nav', mergeAttributes(HTMLAttributes, { 'data-toc': 'true', class: 'stos-toc' }), list];
  },

  onCreate() {
    this.editor.view.dispatch(this.editor.state.tr.setMeta(TOC_SYNC_META, true).setMeta('preventUpdate', true));
  },

  addCommands() {
    return {
      insertTableOfContents:
        () =>
        (props) =>
          insertBlocks(props, [{ type: this.name, attrs: { items: collectHeadings(props.state.doc) } }]),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tableOfContentsKey,
        // Keeps heading ids unique and every TOC node in sync with the document's headings.
        appendTransaction: (transactions, oldState, newState) => {
          const needsSync = transactions.some(
            (transaction) => transaction.docChanged || transaction.getMeta(TOC_SYNC_META),
          );
          if (!needsSync) {
            return null;
          }

          const transaction = newState.tr;
          const seenIds = new Set();

          newState.doc.descendants((node, position) => {
            if (node.type.name !== 'heading') {
              return node.isBlock;
            }
            if (node.attrs.id && !seenIds.has(node.attrs.id)) {
              seenIds.add(node.attrs.id);
              return false;
            }
            const id = createHeadingId();
            seenIds.add(id);
            transaction.setNodeMarkup(position, undefined, { ...node.attrs, id });
            return false;
          });

          const headings = collectHeadings(transaction.doc);
          const serializedHeadings = JSON.stringify(headings);

          transaction.doc.descendants((node, position) => {
            if (node.type.name !== this.name) {
              return node.isBlock;
            }
            if (JSON.stringify(node.attrs.items) !== serializedHeadings) {
              transaction.setNodeMarkup(position, undefined, { ...node.attrs, items: headings });
            }
            return false;
          });

          return transaction.docChanged ? transaction.setMeta('addToHistory', false) : null;
        },
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              const link = event.target instanceof Element ? event.target.closest('a[data-toc-link]') : null;
              if (!link) {
                return false;
              }
              event.preventDefault();
              const id = (link.getAttribute('href') || '').slice(1);
              const target = id ? view.dom.querySelector(`[id="${CSS.escape(id)}"]`) : null;
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
              return true;
            },
          },
        },
      }),
    ];
  },
});

export default TableOfContents;
