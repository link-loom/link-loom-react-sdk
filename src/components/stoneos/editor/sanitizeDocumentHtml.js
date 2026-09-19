import DOMPurify from 'dompurify';

const INLINE_TAGS = ['p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'sub', 'sup', 'code', 'mark', 'a'];
const LIST_TAGS = ['ul', 'ol', 'li', 'label', 'input', 'div'];
const BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'hr', 'details', 'summary', 'div'];
const TABLE_TAGS = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col'];
const MEDIA_TAGS = ['img'];
const DOCUMENT_TAGS = ['nav'];

const PROFILE_TAGS = {
  'slide-text': [...INLINE_TAGS, 'ul', 'ol', 'li'],
  notes: [...INLINE_TAGS, ...LIST_TAGS, ...BLOCK_TAGS, ...TABLE_TAGS, ...MEDIA_TAGS],
  document: [...INLINE_TAGS, ...LIST_TAGS, ...BLOCK_TAGS, ...TABLE_TAGS, ...MEDIA_TAGS, ...DOCUMENT_TAGS],
};

const ALLOWED_ATTRIBUTES = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'colspan',
  'rowspan',
  'colwidth',
  'style',
  'class',
  'id',
  'type',
  'checked',
  'open',
  'start',
  'data-type',
  'data-checked',
  'data-color',
  'data-indent',
  'data-page-break',
  'data-callout',
  'data-toggle',
  'data-toggle-content',
  'data-merge-field',
  'data-label',
  'data-toc',
  'data-toc-link',
  'data-level',
  'data-pending-upload',
  'data-storage-id',
  'data-align',
  'data-style',
  'data-border',
  'data-width',
];

// font-weight / font-style / text-decoration are read by the Bold, Italic, Underline and Strike parse rules
// (pasted Google Docs and Word HTML carry marks that way).
const ALLOWED_STYLES = {
  'font-family': null,
  'font-size': null,
  'font-weight': null,
  'font-style': null,
  'text-decoration': null,
  'text-decoration-line': null,
  color: null,
  'background-color': null,
  'text-align': null,
  'line-height': null,
  'margin-top': null,
  'margin-bottom': null,
  'padding-left': null,
  width: ['img', 'table', 'col', 'td', 'th'],
  'min-width': ['table', 'col'],
  height: ['img', 'table', 'td', 'th'],
};

const UNSAFE_STYLE_VALUE = /url\s*\(|expression\s*\(|javascript:|[<>{}\\@]/i;
const ALLOWED_CLASS = /^(stos-[\w-]+|language-[\w-]+)$/;
const ALLOWED_URI = /^(?:(?:https?|mailto|tel|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

const filterStyle = (tagName, styleText) =>
  String(styleText || '')
    .split(';')
    .map((declaration) => {
      const separator = declaration.indexOf(':');
      if (separator < 0) {
        return null;
      }
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();
      if (!(property in ALLOWED_STYLES) || !value || UNSAFE_STYLE_VALUE.test(value)) {
        return null;
      }
      const tags = ALLOWED_STYLES[property];
      if (tags && !tags.includes(tagName)) {
        return null;
      }
      return `${property}: ${value}`;
    })
    .filter(Boolean)
    .join('; ');

const filterClass = (classText) =>
  String(classText || '')
    .split(/\s+/)
    .filter((name) => ALLOWED_CLASS.test(name))
    .join(' ');

let purifier = null;

const getPurifier = () => {
  if (purifier) {
    return purifier;
  }

  purifier = DOMPurify(window);

  purifier.addHook('uponSanitizeAttribute', (node, data) => {
    const tagName = node.nodeName.toLowerCase();

    if (data.attrName === 'style') {
      data.attrValue = filterStyle(tagName, data.attrValue);
      data.keepAttr = Boolean(data.attrValue);
      return;
    }

    if (data.attrName === 'class') {
      data.attrValue = filterClass(data.attrValue);
      data.keepAttr = Boolean(data.attrValue);
    }
  });

  purifier.addHook('afterSanitizeAttributes', (node) => {
    const tagName = node.nodeName.toLowerCase();

    if (tagName === 'input' && node.getAttribute('type') !== 'checkbox') {
      node.remove();
      return;
    }

    if (tagName === 'a' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return purifier;
};

export const sanitizeDocumentHtml = (html, { profile = 'document' } = {}) => {
  if (!html || typeof window === 'undefined') {
    return '';
  }

  return getPurifier().sanitize(String(html), {
    ALLOWED_TAGS: PROFILE_TAGS[profile] || PROFILE_TAGS.document,
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    ALLOWED_URI_REGEXP: ALLOWED_URI,
    KEEP_CONTENT: true,
  });
};

export default sanitizeDocumentHtml;
