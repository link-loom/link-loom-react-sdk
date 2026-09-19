import { sanitizeDocumentHtml } from '../sanitizeDocumentHtml.js';

const PARAGRAPH_STYLE_MARKDOWN = { title: '#', subtitle: '##' };

const INLINE_MARKERS = { strong: '**', b: '**', em: '*', i: '*', s: '~~', strike: '~~', del: '~~' };

const escapeInline = (text) => text.replace(/([\\`*_[\]])/g, '\\$1');

const wrapMark = (content, marker) => {
  const trimmed = content.trim();
  if (!trimmed) {
    return content;
  }
  const start = content.indexOf(trimmed);
  return `${content.slice(0, start)}${marker}${trimmed}${marker}${content.slice(start + trimmed.length)}`;
};

const isElement = (node) => node.nodeType === 1;
const isText = (node) => node.nodeType === 3;

const serializeInline = (node) => {
  if (isText(node)) {
    return escapeInline(node.textContent.replace(/\s+/g, ' '));
  }
  if (!isElement(node)) {
    return '';
  }

  const tagName = node.nodeName.toLowerCase();
  const children = () => Array.from(node.childNodes).map(serializeInline).join('');

  if (INLINE_MARKERS[tagName]) {
    return wrapMark(children(), INLINE_MARKERS[tagName]);
  }
  if (tagName === 'br') {
    return '  \n';
  }
  if (tagName === 'code') {
    return `\`${node.textContent}\``;
  }
  if (tagName === 'a') {
    return `[${children()}](${node.getAttribute('href') || ''})`;
  }
  if (tagName === 'img') {
    return `![${escapeInline(node.getAttribute('alt') || '')}](${node.getAttribute('src') || ''})`;
  }
  if (node.hasAttribute('data-merge-field')) {
    return node.textContent;
  }
  return children();
};

const indentLines = (text, prefix) =>
  text
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');

// Returns '' for items without content so empty list rows are dropped.
const serializeListItem = (item, marker) => {
  const isTask = item.getAttribute('data-type') === 'taskItem';
  const checkbox = isTask ? `[${item.getAttribute('data-checked') === 'true' ? 'x' : ' '}] ` : '';
  const container = isTask ? item.querySelector(':scope > div') || item : item;

  const blocks = Array.from(container.childNodes)
    .filter((child) => child.nodeName.toLowerCase() !== 'label')
    .map((child) => (isElement(child) && /^(p|ul|ol)$/i.test(child.nodeName) ? serializeBlock(child) : serializeInline(child)))
    .map((text) => text.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return '';
  }

  const [first, ...rest] = blocks;
  const tail = rest.length ? `\n${indentLines(rest.join('\n'), ' '.repeat(marker.length + 1))}` : '';
  return `${marker} ${checkbox}${first}${tail}`;
};

const serializeTable = (table) => {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) {
    return '';
  }

  const cellText = (cell) =>
    Array.from(cell.childNodes)
      .map((child) => serializeInline(child).trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\|/g, '\\|')
      .replace(/\n+/g, ' ');
  // Markdown has no spans: a merged cell keeps its text and pads the columns it covered.
  const rowCells = (row) =>
    Array.from(row.children).flatMap((cell) => [cellText(cell), ...Array.from({ length: (cell.colSpan || 1) - 1 }, () => '')]);
  const lines = rows.map((row) => `| ${rowCells(row).join(' | ')} |`);
  const columnCount = rowCells(rows[0]).length;
  lines.splice(1, 0, `| ${Array.from({ length: columnCount }, () => '---').join(' | ')} |`);
  return lines.join('\n');
};

function serializeChildren(node) {
  return Array.from(node.childNodes)
    .map(serializeBlock)
    .filter((text) => text !== '')
    .join('\n\n');
}

function serializeBlock(node) {
  if (isText(node)) {
    return node.textContent.trim() ? escapeInline(node.textContent.trim()) : '';
  }
  if (!isElement(node)) {
    return '';
  }

  const tagName = node.nodeName.toLowerCase();
  const heading = /^h([1-6])$/.exec(tagName);

  if (heading) {
    const text = serializeInline(node).trim();
    return text ? `${'#'.repeat(Number(heading[1]))} ${text}` : '';
  }
  if (tagName === 'p') {
    const text = serializeInline(node).trim();
    const style = PARAGRAPH_STYLE_MARKDOWN[node.getAttribute('data-style')];
    // Other Markdown readers see a heading; importMarkdown restores the paragraph style from the marker.
    return style && text ? `<!-- ${node.getAttribute('data-style')} -->\n${style} ${text}` : text;
  }
  if (tagName === 'hr') {
    return '---';
  }
  if (tagName === 'pre') {
    const code = node.querySelector('code');
    const language = (code?.className.match(/language-([\w-]+)/) || [])[1] || '';
    return `\`\`\`${language}\n${node.textContent.replace(/\n$/, '')}\n\`\`\``;
  }
  if (tagName === 'blockquote' || node.hasAttribute('data-callout')) {
    return indentLines(serializeChildren(node), '> ');
  }
  if (tagName === 'ul' || tagName === 'ol') {
    const start = parseInt(node.getAttribute('start'), 10) || 1;
    return Array.from(node.children)
      .filter((child) => child.nodeName.toLowerCase() === 'li')
      .map((item, index) => serializeListItem(item, tagName === 'ol' ? `${start + index}.` : '-'))
      .filter(Boolean)
      .join('\n');
  }
  if (tagName === 'table') {
    return serializeTable(node);
  }
  if (tagName === 'img') {
    return serializeInline(node);
  }
  if (node.hasAttribute('data-page-break')) {
    return '<!-- page-break -->';
  }
  if (tagName === 'details') {
    const summary = node.querySelector(':scope > summary');
    const content = node.querySelector(':scope > [data-toggle-content]');
    return [summary ? `**${serializeInline(summary).trim()}**` : '', content ? serializeChildren(content) : '']
      .filter(Boolean)
      .join('\n\n');
  }
  return serializeChildren(node);
}

// Walks sanitized HTML (not ProseMirror JSON) so tables, task lists, toggles and callouts are covered.
export const exportMarkdown = (html) => {
  if (!html || typeof DOMParser === 'undefined') {
    return '';
  }

  const parsed = new DOMParser().parseFromString(sanitizeDocumentHtml(html, { profile: 'document' }), 'text/html');
  return `${serializeChildren(parsed.body).trim()}\n`;
};

export default exportMarkdown;
