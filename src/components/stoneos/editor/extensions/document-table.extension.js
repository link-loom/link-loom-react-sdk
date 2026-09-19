import { Table, TableView } from '@tiptap/extension-table';

export const TABLE_BORDERS = ['all', 'outer', 'none', 'horizontal'];

// 'auto' | 'full' | a width in pixels; anything else means "as resized" (the column widths decide).
export const normalizeTableWidth = (value) => {
  if (value === 'auto' || value === 'full') {
    return value;
  }
  const pixels = Number(String(value ?? '').replace(/px$/, ''));
  return Number.isFinite(pixels) && pixels > 0 ? Math.round(pixels) : null;
};

const normalizeBorder = (value) => (TABLE_BORDERS.includes(value) ? value : null);

const cssWidth = (width) => {
  if (width === 'auto') {
    return 'auto';
  }
  return width === 'full' ? '100%' : `${width}px`;
};

const applyTableAttributes = (table, { border, width }) => {
  if (border) {
    table.setAttribute('data-border', border);
  } else {
    table.removeAttribute('data-border');
  }

  if (!width) {
    table.removeAttribute('data-width');
    return;
  }
  table.setAttribute('data-width', String(width));
  table.style.minWidth = '';
  table.style.width = cssWidth(width);
};

// The resizable editor renders tables through a node view that writes the column widths itself.
class DocumentTableView extends TableView {
  constructor(node, cellMinWidth) {
    super(node, cellMinWidth);
    applyTableAttributes(this.table, node.attrs);
  }

  update(node) {
    const updated = super.update(node);
    if (updated) {
      applyTableAttributes(this.table, node.attrs);
    }
    return updated;
  }
}

export const DocumentTable = Table.extend({
  addOptions() {
    return { ...this.parent?.(), View: DocumentTableView };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      border: {
        default: null,
        parseHTML: (element) => normalizeBorder(element.getAttribute('data-border')),
        renderHTML: (attributes) => (attributes.border ? { 'data-border': attributes.border } : {}),
      },
      width: {
        default: null,
        parseHTML: (element) => normalizeTableWidth(element.getAttribute('data-width')),
        renderHTML: (attributes) => (attributes.width ? { 'data-width': String(attributes.width) } : {}),
      },
    };
  },

  renderHTML(props) {
    const [tag, attributes, ...children] = this.parent(props);
    const { width } = props.node.attrs;
    if (!width) {
      return [tag, attributes, ...children];
    }

    const declarations = String(attributes.style || '')
      .split(';')
      .map((declaration) => declaration.trim())
      .filter((declaration) => declaration && !/^(min-)?width\s*:/i.test(declaration));
    return [tag, { ...attributes, style: [...declarations, `width: ${cssWidth(width)}`].join('; ') }, ...children];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableBorders:
        (border) =>
        ({ commands }) =>
          commands.updateAttributes('table', { border: normalizeBorder(border) }),
      setTableWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes('table', { width: normalizeTableWidth(width) }),
    };
  },
});

export default DocumentTable;
