import { STOS_MODAL_SHELL_STYLES } from '../theme/stoneos.constants.js';

// The name of the size container a record dialog's paper is. The narrow-width rules of the kit
// (`@container stos-record`) and of the app that holds the dialog hang from it.
export const RECORD_CONTAINER_NAME = 'stos-record';

// The modal keeps one size on a screen it fits; on a shorter one (a phone, where the band stacks) it
// scrolls as a whole, so the footer with Save and Close is always reachable. The shell alone clips it.
// On a phone the tabs of a record fit better without their icons.
export const recordDialogPaperSx = (containerName = RECORD_CONTAINER_NAME) => ({
  ...STOS_MODAL_SHELL_STYLES,
  overflowY: 'auto',
  width: 'min(880px, 94vw)',
  containerType: 'inline-size',
  containerName,
  '@media (max-width: 480px)': {
    '& .MuiTab-root': { minWidth: 0, px: 1.5 },
    '& .MuiTab-iconWrapper': { display: 'none' },
  },
});

// Closing asks first only when the content reported unsaved changes through `dirtyRef.current`.
export const hasUnsavedChanges = (dirtyRef) => Boolean(dirtyRef?.current);
