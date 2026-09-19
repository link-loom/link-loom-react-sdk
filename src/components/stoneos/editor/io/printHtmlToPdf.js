import { exportDocumentHtml } from './exportDocumentHtml.js';
import { buildPageRuleCss } from '../pageLayout.js';

const PRINT_CLEANUP_MS = 60000;

const cssString = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ')}"`;

// '{page}' and '{pages}' become CSS page counters inside @page margin boxes.
const toMarginBoxContent = (template) =>
  String(template)
    .split(/(\{page\}|\{pages\})/)
    .filter(Boolean)
    .map((part) => {
      if (part === '{page}') {
        return 'counter(page)';
      }
      if (part === '{pages}') {
        return 'counter(pages)';
      }
      return cssString(part);
    })
    .join(' ');

const buildMarginBoxes = ({ header, footer }) => {
  const boxes = [];
  if (header) {
    boxes.push(`@top-center { content: ${toMarginBoxContent(header)}; font: 9pt 'Inter', sans-serif; color: #515d72; }`);
  }
  if (footer) {
    boxes.push(`@bottom-center { content: ${toMarginBoxContent(footer)}; font: 9pt 'Inter', sans-serif; color: #515d72; }`);
  }
  return boxes.join(' ');
};

const waitForAssets = async (frameDocument) => {
  const images = Array.from(frameDocument.images).filter((image) => !image.complete);
  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        }),
    ),
  );
  if (frameDocument.fonts?.ready) {
    await frameDocument.fonts.ready;
  }
};

// Prints through a hidden iframe; the browser's dialog offers "Save as PDF".
// `documentStylesCss`: the named document styles (e.g. `editor.storage.documentStyles.getDocumentStylesCss()`).
export const printHtmlToPdf = ({
  html,
  title = '',
  pageLayout = null,
  documentStylesCss = '',
  header = '',
  footer = '{page}',
} = {}) =>
  new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('printHtmlToPdf requires a browser document'));
      return;
    }

    const marginBoxes = buildMarginBoxes({ header, footer });
    const documentHtml = exportDocumentHtml({
      html,
      title,
      pageLayout,
      documentStylesCss,
      extraHeadCss: buildPageRuleCss(pageLayout, marginBoxes),
    });

    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

    const cleanup = () => frame.remove();

    frame.addEventListener(
      'load',
      async () => {
        try {
          const frameWindow = frame.contentWindow;
          await waitForAssets(frame.contentDocument);
          frameWindow.addEventListener('afterprint', cleanup, { once: true });
          setTimeout(cleanup, PRINT_CLEANUP_MS);
          frameWindow.focus();
          frameWindow.print();
          resolve();
        } catch (error) {
          cleanup();
          reject(error);
        }
      },
      { once: true },
    );

    frame.srcdoc = documentHtml;
    document.body.appendChild(frame);
  });

export default printHtmlToPdf;
