import { Extension } from '@tiptap/core';

export const OPEN_LINK_EVENT = 'stos:open-link';

// Mod+K over a text selection asks the selection toolbar to open its link panel.
export const LinkShortcut = Extension.create({
  name: 'linkShortcut',

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        if (this.editor.state.selection.empty || typeof this.editor.commands.setLink !== 'function') {
          return false;
        }
        this.editor.emit(OPEN_LINK_EVENT);
        return true;
      },
    };
  },
});

export default LinkShortcut;
