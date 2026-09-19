import { sanitizeDocumentHtml } from '../sanitizeDocumentHtml.js';

const STYLE_MAP = [
  'u => u',
  'strike => s',
  "p[style-name='Title'] => p.stos-paragraph-title:fresh",
  "p[style-name='Subtitle'] => p.stos-paragraph-subtitle:fresh",
];

const toArrayBuffer = async (file) => {
  if (file instanceof ArrayBuffer) {
    return file;
  }
  if (file && typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return null;
};

// Images upload through `uploadImage(file) → Promise<{ url }>` when provided; otherwise they are inlined as data URIs.
const createImageConverter = (mammoth, uploadImage) =>
  mammoth.images.imgElement(async (image) => {
    if (!uploadImage) {
      const base64 = await image.read('base64');
      return { src: `data:${image.contentType};base64,${base64}` };
    }
    const buffer = await image.readAsArrayBuffer();
    const extension = (image.contentType.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const file = new File([buffer], `image.${extension}`, { type: image.contentType });
    const result = await uploadImage(file);
    return { src: result?.url || '' };
  });

export const importDocx = async (file, { uploadImage } = {}) => {
  const arrayBuffer = await toArrayBuffer(file);
  if (!arrayBuffer) {
    throw new Error('importDocx expects a File, Blob or ArrayBuffer');
  }

  const mammothModule = await import('mammoth');
  const mammoth = mammothModule.default || mammothModule;
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: STYLE_MAP, convertImage: createImageConverter(mammoth, uploadImage) },
  );
  return sanitizeDocumentHtml(result.value, { profile: 'document' });
};

export default importDocx;
