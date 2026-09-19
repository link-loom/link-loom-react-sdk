import documentCss from '../document.css?raw';
import { sanitizeDocumentHtml } from '../sanitizeDocumentHtml.js';
import { buildPageRuleCss, resolvePageLayout } from '../pageLayout.js';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const neutralizeStyleText = (css) => String(css || '').replace(/<\/?style/gi, '');

const buildScreenCss = (pageLayout) => {
  if (!pageLayout) {
    return 'body { margin: 0; background: #ffffff; } .stos-doc { max-width: 816px; margin: 0 auto; padding: 48px 24px; }';
  }

  const layout = resolvePageLayout(pageLayout);
  const { top, right, bottom, left } = layout.margins;
  return [
    '@media screen {',
    '  body { margin: 0; background: #eff3f9; }',
    `  .stos-doc { --stos-doc-font-size: 11pt; box-sizing: border-box; width: ${layout.width}mm; min-height: ${layout.height}mm; margin: 24px auto; padding: ${top}mm ${right}mm ${bottom}mm ${left}mm; background: #ffffff; border: 1px solid #e4e8ef; }`,
    '}',
    '@media print { body { margin: 0; } .stos-doc { --stos-doc-font-size: 11pt; } }',
  ].join('\n');
};

// Standalone HTML with the kit's document CSS. `extraHeadCss` is appended last (print margin boxes).
export const exportDocumentHtml = ({ html, title = '', pageLayout = null, documentStylesCss = '', extraHeadCss = '' } = {}) =>
  [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    neutralizeStyleText(documentCss),
    pageLayout ? buildPageRuleCss(pageLayout) : '',
    buildScreenCss(pageLayout),
    neutralizeStyleText(documentStylesCss),
    neutralizeStyleText(extraHeadCss),
    '</style>',
    '</head>',
    '<body>',
    `<article class="stos-doc">${sanitizeDocumentHtml(html, { profile: 'document' })}</article>`,
    '</body>',
    '</html>',
  ].join('\n');

export default exportDocumentHtml;
