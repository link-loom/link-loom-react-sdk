import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const searchReplaceKey = new PluginKey('stosSearchReplace');

const OBJECT_REPLACEMENT = '￼';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Each inline node contributes exactly nodeSize characters, so string offsets map 1:1 to positions.
const findMatches = (doc, term, caseSensitive) => {
  if (!term) {
    return [];
  }

  const pattern = new RegExp(escapeRegExp(term), caseSensitive ? 'g' : 'gi');
  const matches = [];

  doc.descendants((node, position) => {
    if (!node.isTextblock) {
      return true;
    }

    let text = '';
    node.forEach((child) => {
      text += child.isText ? child.text : OBJECT_REPLACEMENT.repeat(child.nodeSize);
    });

    for (const match of text.matchAll(pattern)) {
      const from = position + 1 + match.index;
      matches.push({ from, to: from + match[0].length });
    }
    return false;
  });

  return matches;
};

const buildDecorations = (doc, results, index) =>
  DecorationSet.create(
    doc,
    results.map((result, resultIndex) =>
      Decoration.inline(result.from, result.to, {
        class: resultIndex === index ? 'stos-search-match stos-search-match--current' : 'stos-search-match',
      }),
    ),
  );

export const SearchReplace = Extension.create({
  name: 'searchReplace',

  addStorage() {
    return { searchTerm: '', replaceTerm: '', caseSensitive: false, results: [], index: 0 };
  },

  addCommands() {
    const refresh = (tr, dispatch) => {
      if (dispatch) {
        tr.setMeta(searchReplaceKey, true);
      }
      return true;
    };

    const move = (step) => ({ tr, dispatch, state }) => {
      const { results } = this.storage;
      if (!results.length) {
        return false;
      }
      if (!dispatch) {
        return true;
      }
      this.storage.index = (this.storage.index + step + results.length) % results.length;
      const current = results[this.storage.index];
      tr.setSelection(TextSelection.create(state.doc, current.from, current.to)).scrollIntoView();
      return refresh(tr, dispatch);
    };

    return {
      setSearchTerm:
        (searchTerm) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            this.storage.searchTerm = String(searchTerm || '');
            this.storage.index = 0;
          }
          return refresh(tr, dispatch);
        },
      setReplaceTerm:
        (replaceTerm) =>
        () => {
          this.storage.replaceTerm = String(replaceTerm || '');
          return true;
        },
      setSearchCaseSensitive:
        (caseSensitive) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            this.storage.caseSensitive = Boolean(caseSensitive);
            this.storage.index = 0;
          }
          return refresh(tr, dispatch);
        },
      nextSearchResult: () => move(1),
      previousSearchResult: () => move(-1),
      replace:
        () =>
        ({ tr, dispatch }) => {
          const current = this.storage.results[this.storage.index];
          if (!current) {
            return false;
          }
          if (dispatch) {
            const { replaceTerm } = this.storage;
            if (replaceTerm) {
              tr.insertText(replaceTerm, current.from, current.to);
            } else {
              tr.delete(current.from, current.to);
            }
            tr.setSelection(TextSelection.near(tr.doc.resolve(current.from + replaceTerm.length)));
            tr.setMeta(searchReplaceKey, true);
          }
          return true;
        },
      replaceAll:
        () =>
        ({ tr, dispatch }) => {
          const { results, replaceTerm } = this.storage;
          if (!results.length) {
            return false;
          }
          if (dispatch) {
            [...results].reverse().forEach((result) => {
              if (replaceTerm) {
                tr.insertText(replaceTerm, result.from, result.to);
              } else {
                tr.delete(result.from, result.to);
              }
            });
            this.storage.index = 0;
            tr.setMeta(searchReplaceKey, true);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;

    return [
      new Plugin({
        key: searchReplaceKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (transaction, decorations, oldState, newState) => {
            if (!transaction.docChanged && !transaction.getMeta(searchReplaceKey)) {
              return decorations.map(transaction.mapping, transaction.doc);
            }
            storage.results = findMatches(newState.doc, storage.searchTerm, storage.caseSensitive);
            storage.index = storage.results.length ? Math.min(storage.index, storage.results.length - 1) : 0;
            return buildDecorations(newState.doc, storage.results, storage.index);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export default SearchReplace;
