import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Typography, IconButton } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const CloseButton = styled(IconButton)`
  z-index: 99;
  position: absolute;
  top: 10px;
  right: 10px;
  height: 40px;
`;

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
      <Box className="position-absolute top-50 start-50 translate-middle bg-white" style={styles}>
        <CloseButton onClick={handleClose}>
          <i className="mdi mdi-close"></i>
        </CloseButton>

        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Box className="overflow-auto" style={{ maxHeight: '95vh' }}>
          {children}
        </Box>
      </Box>
    </Modal>
  );
};

export default PopUp;
