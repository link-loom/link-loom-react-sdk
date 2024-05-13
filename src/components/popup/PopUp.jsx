import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import React from 'react';

const PopUp = ({ children, title, id, isOpen, setIsOpen, styles }) => {
  const handleClose = () => setIsOpen(false);
  return (
    <Modal
      id={id}
      data-testid={id}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableAutoFocus
      disableRestoreFocus
    >
      <Box
        className="position-absolute top-50 start-50 translate-middle bg-white p-3"
        style={styles}
      >
        <IconButton className="position-absolute top-0 end-0" onClick={handleClose}>
          <i className="mdi mdi-close"></i>
        </IconButton>

        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Box className="my-3 overflow-auto" style={{ maxHeight: '75vh' }}>
          {children}
        </Box>
      </Box>
    </Modal>
  );
};

export default PopUp;
