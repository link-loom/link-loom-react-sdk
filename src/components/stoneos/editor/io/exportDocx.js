// Builds a .docx Blob from ProseMirror JSON. `header` / `footer` accept '{page}' and '{pages}'; null omits them.
// The writer (and `docx`) loads on first use so documents that never export do not pay for it.
export const exportDocx = async (options = {}) => {
  const { writeDocx } = await import('./docxWriter.js');
  return writeDocx(options);
};

export default exportDocx;
