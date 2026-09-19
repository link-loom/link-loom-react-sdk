import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { importMarkdown } from '../io/importMarkdown.js';

export const MARKDOWN_PASTE_KEY = new PluginKey('stosMarkdownPaste');

// A block-level marker is enough on its own; inline emphasis alone is too common in prose, so two
// independent inline signals are required before plain text is read as Markdown.
const BLOCK_SIGNALS = [
  /^\s{0,3}#{1,6}\s+\S/m,
  /^\s{0,3}(?:[-*+]|\d+[.)])\s+\S/m,
  /^\s{0,3}>\s?\S/m,
  /^\s{0,3}```/m,
  /^\s*\|.*\|\s*\n\s*\|?\s*:?-{3,}/m,
];

const INLINE_SIGNALS = [/\*\*\S[\s\S]*?\*\*/, /\[[^\]\n]+\]\([^)\s]+\)/, /~~\S[\s\S]*?~~/, /`[^`\n]+`/];

export const looksLikeMarkdown = (text) => {
  const value = String(text || '');
  if (!value.trim()) {
    return false;
  }
  if (BLOCK_SIGNALS.some((pattern) => pattern.test(value))) {
    return true;
  }
  return INLINE_SIGNALS.filter((pattern) => pattern.test(value)).length >= 2;
};

// Plain text that reads as Markdown is pasted as formatted content. Clipboards that already carry
// text/html keep the normal paste path, and "paste as plain text" is unaffected because it never
// reaches the editor's paste handling.
export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: MARKDOWN_PASTE_KEY,
        props: {
          handlePaste: (view, event) => {
            const clipboard = event.clipboardData;
            if (!clipboard || Array.from(clipboard.types).includes('text/html')) {
              return false;
            }

            const text = clipboard.getData('text/plain');
            if (!looksLikeMarkdown(text)) {
              return false;
            }

            const html = importMarkdown(text);
            if (!html) {
              return false;
            }

            event.preventDefault();
            editor.commands.insertContent(html);
            return true;
          },
        },
      }),
    ];
  },
});

export default MarkdownPaste;
