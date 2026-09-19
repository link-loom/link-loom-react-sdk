import { sanitizeDocumentHtml } from '../sanitizeDocumentHtml.js';
import { escapeHtml } from './exportDocumentHtml.js';

const CODE_SPAN_TOKEN = (index) => `@@stos-code-${index}@@`;
const CODE_SPAN_PATTERN = /@@stos-code-(\d+)@@/g;
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TASK_PREFIX = /^\[[ xX]\]\s/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const BLOCK_START = /^(#{1,6}\s|```|\s*>)/;

const renderInline = (text) => {
  const codeSpans = [];
  const withoutCode = escapeHtml(text).replace(/`([^`]+)`/g, (match, code) => {
    codeSpans.push(code);
    return CODE_SPAN_TOKEN(codeSpans.length - 1);
  });

  return withoutCode
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (match, stars, underscores) => `<strong>${stars || underscores}</strong>`)
    .replace(/\*([^*]+)\*|\b_([^_]+)_\b/g, (match, stars, underscores) => `<em>${stars || underscores}</em>`)
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/ {2,}$/g, '<br>')
    .replace(CODE_SPAN_PATTERN, (match, index) => `<code>${codeSpans[Number(index)]}</code>`);
};

const splitTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'));

const buildListTree = (lines) => {
  const root = { indent: -1, children: [] };
  const stack = [root];

  lines.forEach((line) => {
    const [, spaces, marker, content] = LIST_ITEM.exec(line);
    while (stack.length > 1 && stack[stack.length - 1].indent >= spaces.length) {
      stack.pop();
    }
    const item = { indent: spaces.length, ordered: /\d/.test(marker), content, children: [] };
    stack[stack.length - 1].children.push(item);
    stack.push(item);
  });

  return root.children;
};

const renderListItems = (items) => {
  if (!items.length) {
    return '';
  }

  const isTaskList = items.every((item) => TASK_PREFIX.test(item.content));
  const body = items
    .map((item) => {
      const nested = renderListItems(item.children);
      if (!isTaskList) {
        return `<li><p>${renderInline(item.content)}</p>${nested}</li>`;
      }
      const checked = /^\[[xX]\]/.test(item.content);
      const text = renderInline(item.content.replace(TASK_PREFIX, ''));
      return `<li data-type="taskItem" data-checked="${checked}"><label><input type="checkbox"${checked ? ' checked' : ''}><span></span></label><div><p>${text}</p>${nested}</div></li>`;
    })
    .join('');

  if (isTaskList) {
    return `<ul data-type="taskList">${body}</ul>`;
  }
  const tag = items[0].ordered ? 'ol' : 'ul';
  return `<${tag}>${body}</${tag}>`;
};

const renderTable = (headerLine, rowLines) => {
  const header = splitTableRow(headerLine);
  const headerHtml = `<tr>${header.map((cell) => `<th><p>${renderInline(cell)}</p></th>`).join('')}</tr>`;
  const bodyHtml = rowLines
    .map(splitTableRow)
    .map((row) => `<tr>${header.map((cell, index) => `<td><p>${renderInline(row[index] || '')}</p></td>`).join('')}</tr>`)
    .join('');
  return `<table><tbody>${headerHtml}${bodyHtml}</tbody></table>`;
};

const takeWhile = (lines, start, predicate) => {
  const taken = [];
  let index = start;
  while (index < lines.length && predicate(lines[index])) {
    taken.push(lines[index]);
    index += 1;
  }
  return { taken, next: index };
};

function renderBlocks(lines) {
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^```\s*([\w-]*)\s*$/.exec(line);
    if (fence) {
      const { taken, next } = takeWhile(lines, index + 1, (candidate) => !/^```\s*$/.test(candidate));
      const languageClass = fence[1] ? ` class="language-${fence[1]}"` : '';
      output.push(`<pre><code${languageClass}>${escapeHtml(taken.join('\n'))}</code></pre>`);
      index = next + 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      output.push('<hr>');
      index += 1;
      continue;
    }

    const paragraphStyle = /^\s*<!--\s*(title|subtitle)\s*-->\s*$/.exec(line);
    if (paragraphStyle && lines[index + 1]?.trim()) {
      const text = lines[index + 1].replace(/^#{1,6}\s+/, '').replace(/\s*#*\s*$/, '');
      output.push(`<p data-style="${paragraphStyle[1]}">${renderInline(text)}</p>`);
      index += 2;
      continue;
    }

    if (/^\s*<!--\s*page-break\s*-->\s*$/.test(line)) {
      output.push('<div data-page-break="true"></div>');
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const { taken, next } = takeWhile(lines, index, (candidate) => /^\s*>/.test(candidate));
      output.push(`<blockquote>${renderBlocks(taken.map((quoted) => quoted.replace(/^\s*>\s?/, '')))}</blockquote>`);
      index = next;
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const { taken, next } = takeWhile(lines, index, (candidate) => LIST_ITEM.test(candidate));
      output.push(renderListItems(buildListTree(taken)));
      index = next;
      continue;
    }

    if (line.includes('|') && TABLE_DIVIDER.test(lines[index + 1] || '')) {
      const { taken, next } = takeWhile(lines, index + 2, (candidate) => candidate.includes('|') && Boolean(candidate.trim()));
      output.push(renderTable(line, taken));
      index = next;
      continue;
    }

    const { taken, next } = takeWhile(
      lines,
      index,
      (candidate) => Boolean(candidate.trim()) && !BLOCK_START.test(candidate) && !LIST_ITEM.test(candidate),
    );
    output.push(`<p>${taken.map(renderInline).join('\n')}</p>`);
    index = next;
  }

  return output.join('');
}

// Minimal Markdown subset: headings, emphasis, strike, code, links, images, quotes, lists, task lists, tables.
export const importMarkdown = (markdown) => {
  if (!markdown) {
    return '';
  }

  const html = renderBlocks(String(markdown).replace(/\r\n?/g, '\n').split('\n'));
  return sanitizeDocumentHtml(html, { profile: 'document' });
};

export default importMarkdown;
