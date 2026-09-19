import React, { useEffect, useState } from 'react';
import { Snackbar as MaterialSnackbar, Alert, useTheme } from '@mui/material';

export const openSnackbar = (message, action) => {
  const event = new CustomEvent('snackbar', { detail: { message, action } });
  window.dispatchEvent(event);
};

export const Snackbar = ({ children }) => {
  // This provider is mounted by the host, usually above the StoneOS theme provider, so the
  // `MuiSnackbar` portal scope in createStoneOSTheme never reaches it. It carries the scope
  // itself instead — otherwise the toast is the one portaled surface that ignores dark mode.
  const theme = useTheme();
  const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: '', action: '' });


  useEffect(() => {
    const handleSnackbarEvent = (event) => {
      const { message, action } = event.detail;
      setSnackbar({ message, action });
      setIsOpenSnackbar(true);
    };

    window.addEventListener('snackbar', handleSnackbarEvent);
    return () => {
      window.removeEventListener('snackbar', handleSnackbarEvent);
    };
  }, []);

  const handleCloseSnackbar = () => setIsOpenSnackbar(false);

  return (
    <>
      {children}
      <MaterialSnackbar
        data-stos-theme={theme?.palette?.mode === 'dark' ? 'dark' : 'light'}
        open={isOpenSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.action}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </MaterialSnackbar>
    </>
  );
};
