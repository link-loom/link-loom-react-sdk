import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar as MaterialSnackbar, Alert } from '@mui/material';

export const Snackbar = ({ children }) => {
  const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: '', action: '' });

  const openSnackbar = useCallback((message, action) => {
    const event = new CustomEvent('snackbar', { detail: { message, action } });
    window.dispatchEvent(event);
  }, []);

  const useSnackbar = () => ({
    openSnackbar,
  });

  useEffect(() => {
    const handleSnackbarEvent = (event) => {
      const { message, action } = event.detail;
      setSnackbar({ message, action });
      setIsOpenSnackbar(true);
    };

    window.addEventListener('snackbar', handleSnackbarEvent);
    return () => window.removeEventListener('snackbar', handleSnackbarEvent);
  }, []);

  const handleCloseSnackbar = () => setIsOpenSnackbar(false);

  return (
    <>
      {children(useSnackbar)}
      <MaterialSnackbar
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
