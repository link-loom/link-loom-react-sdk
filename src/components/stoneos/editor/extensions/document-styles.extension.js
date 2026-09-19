import { Extension } from '@tiptap/core';

export const DOCUMENT_STYLES_META = 'stosDocumentStyles';

// Named styles map to document elements; unknown names become `.stos-style-{name}` classes.
const STYLE_SELECTORS = {
  normal: 'p',
  title: "p[data-style='title']",
  subtitle: "p[data-style='subtitle']",
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  heading4: 'h4',
  heading5: 'h5',
  heading6: 'h6',
  quote: 'blockquote',
  code: 'pre',
  link: 'a',
  table: 'table',
};

const STYLE_NAME = /^[A-Za-z][\w-]*$/;

// Declarations only: braces, angle brackets, at-rules, urls and expressions are dropped.
const sanitizeDeclarations = (css) =>
  String(css || '')
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => /^[a-z-]+\s*:\s*[^{}<>@\\]+$/i.test(declaration))
    .filter((declaration) => !/url\s*\(|expression\s*\(|javascript:/i.test(declaration))
    .join('; ');

export const buildDocumentStylesCss = (styles, scope = '.stos-doc') =>
  Object.keys(styles || {})
    .filter((name) => STYLE_NAME.test(name))
    .map((name) => {
      const declarations = sanitizeDeclarations(styles[name]);
      if (!declarations) {
        return '';
      }
      const selector = STYLE_SELECTORS[name] || `.stos-style-${name}`;
      return `${scope} ${selector} { ${declarations}; }`;
    })
    .filter(Boolean)
    .join('\n');

export const DocumentStyles = Extension.create({
  name: 'documentStyles',

  addStorage() {
    const storage = {
      styles: {},
      getDocumentStylesCss: (scope) => buildDocumentStylesCss(storage.styles, scope),
    };
    return storage;
  },

  addCommands() {
    const notify = (tr, dispatch) => {
      if (dispatch) {
        tr.setMeta(DOCUMENT_STYLES_META, true);
      }
      return true;
    };

    return {
      setDocumentStyle:
        (name, css) =>
        ({ tr, dispatch }) => {
          if (!STYLE_NAME.test(String(name || ''))) {
            return false;
          }
          if (dispatch) {
            const nextStyles = { ...this.storage.styles };
            if (css) {
              nextStyles[name] = sanitizeDeclarations(css);
            } else {
              delete nextStyles[name];
            }
            this.storage.styles = nextStyles;
          }
          return notify(tr, dispatch);
        },
      setDocumentStyles:
        (styles) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            this.storage.styles = Object.keys(styles || {})
              .filter((name) => STYLE_NAME.test(name))
              .reduce((result, name) => ({ ...result, [name]: sanitizeDeclarations(styles[name]) }), {});
          }
          return notify(tr, dispatch);
        },
    };
  },
});

export default DocumentStyles;
