import { Extension, mergeAttributes } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { storageIdFromUrl } from '../io/resolveStorageImages.js';

export const IMAGE_ALIGNMENTS = ['left', 'center', 'right'];

const sizeAttribute = (name) => ({
  default: null,
  parseHTML: (element) => element.getAttribute(name) || element.style[name] || null,
  renderHTML: (attributes) => (attributes[name] ? { [name]: String(attributes[name]).replace(/px$/, '') } : {}),
});

// Images of storage objects persist only `data-storage-id`: the `src` is a short-lived URL minted on render
// through `resolveStorageUrl(id) → Promise<string>` (ImageUpload option) and never serialized.
export const DocumentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => (storageIdFromElement(element) ? null : element.getAttribute('src')),
        renderHTML: (attributes) => (attributes.storageId || !attributes.src ? {} : { src: attributes.src }),
      },
      storageId: {
        default: null,
        parseHTML: (element) => storageIdFromElement(element),
        renderHTML: (attributes) => (attributes.storageId ? { 'data-storage-id': attributes.storageId } : {}),
      },
      width: sizeAttribute('width'),
      height: sizeAttribute('height'),
      // left / right float with the text wrapping around; center stands alone.
      align: {
        default: null,
        parseHTML: (element) => (IMAGE_ALIGNMENTS.includes(element.getAttribute('data-align')) ? element.getAttribute('data-align') : null),
        renderHTML: (attributes) => (attributes.align ? { 'data-align': attributes.align } : {}),
      },
      pendingUpload: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-pending-upload') || null,
        renderHTML: (attributes) => (attributes.pendingUpload ? { 'data-pending-upload': attributes.pendingUpload } : {}),
      },
    };
  },

  // Tiptap only parses `img[src]`; kit content persists storage images without `src`.
  parseHTML() {
    const selector = this.options.allowBase64 ? 'img' : 'img:not([src^="data:"])';
    return [{ tag: `${selector}[src]` }, { tag: 'img[data-storage-id]' }, { tag: 'img[data-pending-upload]' }];
  },

  addNodeView() {
    return ({ node, editor }) => {
      const image = document.createElement('img');
      let currentNode = node;
      let requestedId = null;

      const applyAttributes = () => {
        const attributes = mergeAttributes(this.options.HTMLAttributes, renderNodeAttributes(editor, currentNode));
        [...image.attributes].forEach(({ name }) => name !== 'src' && image.removeAttribute(name));
        Object.entries(attributes).forEach(([name, value]) => {
          if (name !== 'src' && value !== null && value !== undefined) {
            image.setAttribute(name, value);
          }
        });
      };

      const renderSource = () => {
        const { storageId, src } = currentNode.attrs;
        if (!storageId) {
          requestedId = null;
          if (src) {
            image.setAttribute('src', src);
          } else {
            image.removeAttribute('src');
          }
          return;
        }
        if (requestedId === storageId) {
          return;
        }
        requestedId = storageId;
        image.removeAttribute('src');
        const resolveStorageUrl = editor.storage.imageUpload?.resolveStorageUrl;
        if (typeof resolveStorageUrl !== 'function') {
          image.setAttribute('data-storage-unavailable', 'true');
          return;
        }
        Promise.resolve(resolveStorageUrl(storageId))
          .then((url) => {
            if (requestedId !== storageId || !url) {
              return;
            }
            image.removeAttribute('data-storage-unavailable');
            image.setAttribute('src', url);
          })
          .catch(() => {
            if (requestedId === storageId) {
              image.setAttribute('data-storage-unavailable', 'true');
            }
          });
      };

      applyAttributes();
      renderSource();

      return {
        dom: image,
        // The view writes `src` asynchronously; ProseMirror must not re-render the node for those attribute mutations.
        ignoreMutation: (mutation) => mutation.type === 'attributes',
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          applyAttributes();
          renderSource();
          return true;
        },
      };
    };
  },
});

const storageIdFromElement = (element) =>
  element.getAttribute('data-storage-id') || storageIdFromUrl(element.getAttribute('src'));

// The HTML attributes a node renders with (the same ones `renderHTML` produces), without its `src`.
const renderNodeAttributes = (editor, node) => {
  const dom = editor.schema.nodes.image.spec.toDOM?.(node);
  return Array.isArray(dom) && dom[1] && typeof dom[1] === 'object' ? { ...dom[1] } : {};
};

const BLOB_URL_PREFIX = 'blob:';

const pendingUploadKey = (node) => {
  if (node.type.name !== 'image') {
    return null;
  }
  if (node.attrs.pendingUpload) {
    return node.attrs.pendingUpload;
  }
  return String(node.attrs.src || '').startsWith(BLOB_URL_PREFIX) ? node.attrs.src : null;
};

// Swaps images that still point at an offline upload (a `blob:` URL, or a `data-pending-upload` local id
// written by autosave) for their storage object once `resolvePendingUpload(key) → Promise<{ id } | string | null>`
// knows it. An `{ id }` becomes `data-storage-id` (rendered through `resolveStorageUrl`); a string is kept as `src`.
export const resolvePendingImages = async (editor, resolvePendingUpload) => {
  if (!editor || editor.isDestroyed || typeof resolvePendingUpload !== 'function') {
    return false;
  }

  const keys = new Set();
  editor.state.doc.descendants((node) => {
    const key = pendingUploadKey(node);
    if (key) {
      keys.add(key);
    }
  });
  if (!keys.size) {
    return false;
  }

  const resolvedEntries = await Promise.all(
    [...keys].map(async (key) => [key, await Promise.resolve(resolvePendingUpload(key)).catch(() => null)]),
  );
  const resolvedFiles = new Map(resolvedEntries.map(([key, value]) => [key, toResolvedImage(value)]).filter(([, value]) => value));
  if (!resolvedFiles.size || editor.isDestroyed) {
    return false;
  }

  const { tr } = editor.state;
  editor.state.doc.descendants((node, position) => {
    const resolved = resolvedFiles.get(pendingUploadKey(node));
    if (resolved) {
      tr.setNodeMarkup(position, undefined, { ...node.attrs, ...resolved, pendingUpload: null });
    }
  });
  if (!tr.docChanged) {
    return false;
  }

  editor.view.dispatch(tr.setMeta('addToHistory', false));
  return true;
};

const toResolvedImage = (value) => {
  if (typeof value === 'string' && value) {
    return { src: value, storageId: storageIdFromUrl(value) };
  }
  if (value?.id) {
    return { src: null, storageId: value.id };
  }
  return null;
};

const isImageFile = (file) => Boolean(file && typeof file.type === 'string' && file.type.startsWith('image/'));

// Uploads through `uploadImage(file) → Promise<{ id, url, pending }>` and inserts at `position` (or the selection).
// A synced upload is referenced by `data-storage-id`; an offline one keeps its `blob:` placeholder until it syncs.
export const insertImageFile = async (editor, file, position) => {
  const uploadImage = editor?.storage?.imageUpload?.uploadImage;
  if (!uploadImage || !isImageFile(file)) {
    return false;
  }

  const result = await uploadImage(file);
  const storageId = result?.id && !result.pending ? result.id : storageIdFromUrl(result?.url);
  if ((!storageId && !result?.url) || editor.isDestroyed) {
    return false;
  }

  const content = { type: 'image', attrs: { src: storageId ? null : result.url, storageId, alt: file.name || null } };
  if (typeof position === 'number') {
    return editor.chain().focus().insertContentAt(position, content).run();
  }
  return editor.chain().focus().insertContent(content).run();
};

export const ImageUpload = Extension.create({
  name: 'imageUpload',

  addOptions() {
    return { uploadImage: null, resolveStorageUrl: null };
  },

  addStorage() {
    return { uploadImage: this.options.uploadImage, resolveStorageUrl: this.options.resolveStorageUrl };
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    const insertFiles = (files, position) => {
      const images = Array.from(files || []).filter(isImageFile);
      if (!images.length || !this.storage.uploadImage) {
        return false;
      }
      images.forEach((file) => insertImageFile(editor, file, position));
      return true;
    };

    return [
      new Plugin({
        key: new PluginKey('stosImageUpload'),
        props: {
          handlePaste: (view, event) => insertFiles(event.clipboardData?.files),
          handleDrop: (view, event) => {
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            return insertFiles(event.dataTransfer?.files, coordinates?.pos);
          },
        },
      }),
    ];
  },
});
