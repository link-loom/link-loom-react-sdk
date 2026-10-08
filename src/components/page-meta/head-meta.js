// The <head> tags a page's meta controls. Tags this module creates carry `data-ll-meta`, so a page that stops
// declaring a value removes only what it added and never what index.html shipped.
const MARK = 'data-ll-meta';

const HEAD_TAGS = Object.freeze([
  { key: 'description', tag: 'meta', match: ['name', 'description'], attribute: 'content' },
  { key: 'robots', tag: 'meta', match: ['name', 'robots'], attribute: 'content' },
  { key: 'canonical', tag: 'link', match: ['rel', 'canonical'], attribute: 'href' },
  { key: 'ogTitle', tag: 'meta', match: ['property', 'og:title'], attribute: 'content' },
  { key: 'ogDescription', tag: 'meta', match: ['property', 'og:description'], attribute: 'content' },
  { key: 'ogImage', tag: 'meta', match: ['property', 'og:image'], attribute: 'content' },
  { key: 'ogType', tag: 'meta', match: ['property', 'og:type'], attribute: 'content' },
  { key: 'twitterCard', tag: 'meta', match: ['name', 'twitter:card'], attribute: 'content' },
  { key: 'twitterTitle', tag: 'meta', match: ['name', 'twitter:title'], attribute: 'content' },
  { key: 'twitterDescription', tag: 'meta', match: ['name', 'twitter:description'], attribute: 'content' },
  { key: 'twitterImage', tag: 'meta', match: ['name', 'twitter:image'], attribute: 'content' },
]);

export const SEO_FIELDS = Object.freeze(['description', 'robots', 'canonical', 'openGraph']);

export const hasSeoFields = (meta) => SEO_FIELDS.some((field) => Boolean(meta?.[field]));

/** What each <head> tag should say for the current page, falling back to the app's defaults. */
export const resolveHeadMeta = ({ meta = {}, defaults = {}, appName = '' }) => {
  const title = meta.openGraph?.title || [meta.title, appName].filter(Boolean).join(' · ') || defaults.title || '';
  const description = meta.openGraph?.description || meta.description || defaults.description || '';
  const image = meta.openGraph?.image || defaults.image || '';

  return {
    description: meta.description || defaults.description || '',
    robots: meta.robots || defaults.robots || '',
    canonical: meta.canonical || defaults.canonical || '',
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: meta.openGraph?.type || defaults.type || 'website',
    twitterCard: image ? 'summary_large_image' : 'summary',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  };
};

export const applyHeadMeta = (doc, values) => {
  for (const entry of HEAD_TAGS) {
    const [matchAttribute, matchValue] = entry.match;
    const existing = doc.head.querySelector(`${entry.tag}[${matchAttribute}="${matchValue}"]`);
    const value = values[entry.key];

    if (!value) {
      if (existing?.hasAttribute(MARK)) {
        existing.remove();
      }
      continue;
    }

    const element = existing || doc.createElement(entry.tag);
    if (!existing) {
      element.setAttribute(matchAttribute, matchValue);
      element.setAttribute(MARK, '');
      doc.head.appendChild(element);
    }

    element.setAttribute(entry.attribute, value);
  }
};
