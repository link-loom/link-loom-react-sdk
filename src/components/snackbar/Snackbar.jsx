import React, { createContext, useContext, useState } from "react";
import { Snackbar as MaterialSnackbar, Alert } from "@mui/material";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error(`useSnackbar need to be used into SnackbarProvider`);
  }

  return context;
};

export const Snackbar = ({ children }) => {
  const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
  const [snackbar, setSnackbar] = useState({
    message: "",
    action: "",
  });

  const openSnackbar = (message, action) => {
    switch (action) {
      case "success":
        handleOpenSnackbar(message, action);
        break;
      case "error":
        handleOpenSnackbar(message, action);
        break;
      case "info":
        handleOpenSnackbar(message, action);
        break;
      case "warning":
        handleOpenSnackbar(message, action);
        break;
      default:
        break;
    }
  };

  const handleOpenSnackbar = (message, action) => {
    setSnackbar({ message, action });
    setIsOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setIsOpenSnackbar(null);
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, handleCloseSnackbar }}>
      {children}
      {isOpenSnackbar && (
        <MaterialSnackbar
          open={isOpenSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          data-testid="success-snackbar"
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.action}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </MaterialSnackbar>
      )}
    </SnackbarContext.Provider>
  );
};
