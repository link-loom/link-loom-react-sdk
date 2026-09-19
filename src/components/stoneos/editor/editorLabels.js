import { SLASH_COMMAND_LABELS } from './extensions/slash-command/slashItems.js';

// Copy of the editor chrome (block gutter, block menu, selection toolbar). Hosts override any key
// through the `labels` prop of RichDocumentEditor; block type labels reuse the slash menu keys.
export const EDITOR_UI_LABELS = {
  blockAddBelow: 'Click to add below',
  blockDragHandle: 'Drag to move · click for options',
  blockMenu: 'Block options',
  blockTurnInto: 'Turn into',
  blockDuplicate: 'Duplicate',
  blockDelete: 'Delete',
  toolbar: 'Formatting',
  turnInto: 'Turn into',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  code: 'Inline code',
  link: 'Link',
  linkPlaceholder: 'Paste or type a link',
  linkApply: 'Apply',
  linkRemove: 'Remove link',
  color: 'Color',
  textColor: 'Text color',
  highlight: 'Highlight',
  colorDefault: 'Default',
  color_coral: 'Coral',
  color_amber: 'Amber',
  color_green: 'Green',
  color_cyan: 'Teal',
  color_blue: 'Blue',
  color_indigo: 'Indigo',
  color_purple: 'Purple',
  color_pink: 'Pink',
  slashPlaceholder: "Type '/' for commands",
};

export const EDITOR_LABELS = { ...SLASH_COMMAND_LABELS, ...EDITOR_UI_LABELS };
