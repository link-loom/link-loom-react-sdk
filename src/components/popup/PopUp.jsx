import React, { useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Typography, IconButton } from '@mui/material';
import styled from 'styled-components';

const CloseButton = styled(IconButton)`
  z-index: 99;
  position: absolute;
  top: 10px;
  right: 10px;
  height: 40px;
`;

const PopUp = ({ children, title, id, isOpen, setIsOpen, styles }) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Modal
      id={id}
      data-testid={id}
      open={isOpen}
      onClose={() => {
        handleClose();
        document.body.style.overflow = '';
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableAutoFocus
      disableRestoreFocus
    >
      <Box
        className="position-absolute top-50 start-50 translate-middle bg-white"
        style={styles}
      >
        <CloseButton onClick={handleClose}>
          <i className={'mdi mdi-close ' + styles?.closeButtonColor}></i>
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
