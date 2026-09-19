import {
  NotesOutlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  Looks3Outlined,
  FormatListBulletedOutlined,
  FormatListNumberedOutlined,
  CheckBoxOutlined,
  ArrowRightOutlined,
  FormatQuoteOutlined,
  InfoOutlined,
  HorizontalRuleOutlined,
  CodeOutlined,
  TableChartOutlined,
  ImageOutlined,
} from '@mui/icons-material';
import { insertImageFile } from '../image.extension.js';

export const SLASH_COMMAND_LABELS = {
  text: 'Text',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  taskList: 'To-do list',
  toggle: 'Toggle',
  quote: 'Quote',
  callout: 'Callout',
  divider: 'Divider',
  codeBlock: 'Code',
  table: 'Table',
  image: 'Image',
  noResults: 'No results',
};

const pickImageFile = (editor) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', () => insertImageFile(editor, input.files?.[0]));
  input.click();
};

const SLASH_ITEMS = [
  { id: 'text', icon: NotesOutlined, keywords: 'paragraph p', command: 'setParagraph', run: (chain) => chain.setParagraph() },
  { id: 'heading1', icon: LooksOneOutlined, keywords: 'h1 title', command: 'setHeading', run: (chain) => chain.setHeading({ level: 1 }) },
  { id: 'heading2', icon: LooksTwoOutlined, keywords: 'h2 subtitle', command: 'setHeading', run: (chain) => chain.setHeading({ level: 2 }) },
  { id: 'heading3', icon: Looks3Outlined, keywords: 'h3', command: 'setHeading', run: (chain) => chain.setHeading({ level: 3 }) },
  { id: 'bulletList', icon: FormatListBulletedOutlined, keywords: 'ul bullet unordered', command: 'toggleBulletList', run: (chain) => chain.toggleBulletList() },
  { id: 'orderedList', icon: FormatListNumberedOutlined, keywords: 'ol numbered ordered', command: 'toggleOrderedList', run: (chain) => chain.toggleOrderedList() },
  { id: 'taskList', icon: CheckBoxOutlined, keywords: 'todo task checkbox', command: 'toggleTaskList', run: (chain) => chain.toggleTaskList() },
  { id: 'toggle', icon: ArrowRightOutlined, keywords: 'details collapse', command: 'setToggle', run: (chain) => chain.setToggle() },
  { id: 'quote', icon: FormatQuoteOutlined, keywords: 'blockquote citation', command: 'toggleBlockquote', run: (chain) => chain.toggleBlockquote() },
  { id: 'callout', icon: InfoOutlined, keywords: 'note info alert', command: 'setCallout', run: (chain) => chain.setCallout('info') },
  { id: 'divider', icon: HorizontalRuleOutlined, keywords: 'hr rule separator', command: 'setHorizontalRule', run: (chain) => chain.setHorizontalRule() },
  { id: 'codeBlock', icon: CodeOutlined, keywords: 'code pre snippet', command: 'toggleCodeBlock', run: (chain) => chain.toggleCodeBlock() },
  {
    id: 'table',
    icon: TableChartOutlined,
    keywords: 'grid rows columns',
    command: 'insertTable',
    run: (chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
  },
  { id: 'image', icon: ImageOutlined, keywords: 'picture photo upload', command: 'setImage', run: null },
];

export const getSlashItems = ({ editor, query, labels }) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  return SLASH_ITEMS.filter((item) => typeof editor.commands[item.command] === 'function')
    .filter((item) => item.id !== 'image' || Boolean(editor.storage.imageUpload?.uploadImage))
    .map((item) => ({ ...item, label: labels[item.id] || SLASH_COMMAND_LABELS[item.id] }))
    .filter(
      (item) =>
        !normalizedQuery ||
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.keywords.includes(normalizedQuery),
    );
};

export const runSlashItem = ({ editor, range, item }) => {
  const chain = editor.chain().focus().deleteRange(range);

  if (item.id === 'image') {
    chain.run();
    pickImageFile(editor);
    return;
  }

  item.run(chain).run();
};
