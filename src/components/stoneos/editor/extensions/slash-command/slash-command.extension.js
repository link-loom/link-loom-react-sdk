import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import SlashCommandMenu from './SlashCommandMenu.component.jsx';
import { SLASH_COMMAND_LABELS, getSlashItems, runSlashItem } from './slashItems.js';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return { labels: SLASH_COMMAND_LABELS };
  },

  addProseMirrorPlugins() {
    const labels = { ...SLASH_COMMAND_LABELS, ...this.options.labels };

    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey('stosSlashCommand'),
        char: '/',
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return !$from.parent.type.spec.code;
        },
        items: ({ editor, query }) => getSlashItems({ editor, query, labels }),
        command: ({ editor, range, props }) => runSlashItem({ editor, range, item: props }),
        render: () => {
          let renderer = null;
          let hidden = false;

          return {
            onStart: (props) => {
              hidden = false;
              renderer = new ReactRenderer(SlashCommandMenu, {
                editor: props.editor,
                props: { ...props, labels, open: true },
              });
            },
            onUpdate: (props) => {
              hidden = false;
              renderer?.updateProps({ ...props, labels, open: true });
            },
            onKeyDown: ({ event }) => {
              if (hidden) {
                return false;
              }
              if (event.key === 'Escape') {
                hidden = true;
                renderer?.updateProps({ open: false });
                return true;
              }
              return renderer?.ref?.onKeyDown(event) ?? false;
            },
            onExit: () => {
              renderer?.destroy();
              renderer = null;
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommand;
