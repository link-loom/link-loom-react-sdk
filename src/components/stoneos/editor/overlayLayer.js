// Editor popups (slash menu, selection toolbar) are portalled out of the editor content, so they must be
// rendered in the layer of the surface that hosts the editor and above it. When the editor is embedded in
// a dialog that surface is the modal layer, which the StoneOS theme raises well above the MUI defaults.
export const MODAL_ROOT_CLASS = 'MuiDialog-root';

export const editorOverlayZIndex = (theme) => (theme?.zIndex?.modal ?? 1300) + 10;

export default editorOverlayZIndex;
