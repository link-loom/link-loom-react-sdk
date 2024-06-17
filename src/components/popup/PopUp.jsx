import React, { useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Typography, IconButton } from '@mui/material';
import styled from 'styled-components';

const CloseButton = styled(IconButton)`
  z-index: 99;
  position: absolute !important;
  top: 10px;
  right: 10px;
  height: 40px;
`;

function setBodyOverflowHidden(isHidden) {
  document.body.style.overflow = isHidden ? 'hidden' : '';
}

const PopUp = ({ children, title, id, isOpen, setIsOpen, styles }) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      setBodyOverflowHidden(true);
    } else {
      setBodyOverflowHidden(false);
    }

    return () => {
      setBodyOverflowHidden(false);
    };
  }, [isOpen]);

  return (
    <Modal
      id={id}
      data-testid={id}
      open={isOpen}
      onClose={() => {
        handleClose();
        setBodyOverflowHidden(false);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableAutoFocus
      disableRestoreFocus
    >
      <Box className="position-absolute top-50 start-50 translate-middle bg-white" style={styles}>
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
