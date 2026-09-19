// Content written before storage ids existed kept LLC file URLs (`/storage/file/sto-…?token=…`).
const LEGACY_STORAGE_URL = /\/storage\/file\/(sto-[0-9a-f]+)(?:[/?#]|$)/i;

export const storageIdFromUrl = (url) => LEGACY_STORAGE_URL.exec(String(url || ''))?.[1] || null;

// Resolves `data-storage-id` images for export (DOCX, HTML, print, Markdown): HTML strings get a `src` and
// ProseMirror JSON image nodes get `attrs.src`. Unresolvable images keep no `src`.
export const resolveStorageImages = async (content, resolveStorageUrl) => {
  if (typeof resolveStorageUrl !== 'function' || !content) {
    return content;
  }

  if (typeof content === 'string') {
    const ids = [...new Set([...content.matchAll(/data-storage-id="([^"]+)"/g)].map((match) => match[1]))];
    const urls = await resolveUrls(ids, resolveStorageUrl);
    return content.replace(/<img\b[^>]*>/g, (tag) => {
      const storageId = /data-storage-id="([^"]+)"/.exec(tag)?.[1];
      if (!storageId || !urls.get(storageId)) {
        return tag;
      }
      const withoutSource = tag.replace(/\ssrc="[^"]*"/, '');
      return withoutSource.replace(/^<img/, `<img src="${urls.get(storageId).replace(/"/g, '&quot;')}"`);
    });
  }

  const ids = new Set();
  const collect = (node) => {
    if (node?.type === 'image' && node.attrs?.storageId) {
      ids.add(node.attrs.storageId);
    }
    (node?.content || []).forEach(collect);
  };
  collect(content);
  const urls = await resolveUrls([...ids], resolveStorageUrl);
  const apply = (node) => {
    if (!node || typeof node !== 'object') {
      return node;
    }
    const attrs = node.type === 'image' && node.attrs?.storageId ? { ...node.attrs, src: urls.get(node.attrs.storageId) || null } : node.attrs;
    return { ...node, ...(attrs && { attrs }), ...(node.content && { content: node.content.map(apply) }) };
  };
  return apply(content);
};

const resolveUrls = async (ids, resolveStorageUrl) =>
  new Map(await Promise.all(ids.map(async (id) => [id, await Promise.resolve(resolveStorageUrl(id)).catch(() => null)])));

