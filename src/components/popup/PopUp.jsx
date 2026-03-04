import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styled, { css } from 'styled-components';

// Width of the Command Center sidebar in pixels (must match CommandCenterChat.jsx drawerWidth).
const COMMAND_CENTER_SIDEBAR_WIDTH = 400;

const CloseButton = styled(IconButton)`
  z-index: 99;
  position: absolute !important;
  top: 10px;
  right: 10px;
  height: 40px;
`;

/**
 * Positions the modal content centred within the available viewport area.
 * When the Command Center sidebar is open the available area shrinks by
 * COMMAND_CENTER_SIDEBAR_WIDTH px on the right, so the horizontal centre
 * shifts left accordingly.
 *
 * The transition duration and easing match the sidebar animation so both
 * elements move in sync.
 */
const ModalPositioner = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: left 225ms cubic-bezier(0, 0, 0.2, 1);

  ${({ $sidebarOpen }) =>
    $sidebarOpen
      ? css`
          left: calc((100vw - ${COMMAND_CENTER_SIDEBAR_WIDTH}px) / 2);
        `
      : css`
          left: 50%;
        `}
`;

function setBodyOverflowHidden(isHidden) {
  document.body.style.overflow = isHidden ? 'hidden' : '';
}

const PopUp = ({ children, title, id, isOpen, setIsOpen, styles }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for Command Center sidebar open/close events so the modal can
  // re-centre itself within the available viewport area.
  useEffect(() => {
    const handleSidebarOpen = () => setSidebarOpen(true);
    const handleSidebarClose = () => setSidebarOpen(false);

    window.addEventListener('sommatic:command-center-opened', handleSidebarOpen);
    window.addEventListener('sommatic:command-center-closed', handleSidebarClose);

    return () => {
      window.removeEventListener('sommatic:command-center-opened', handleSidebarOpen);
      window.removeEventListener('sommatic:command-center-closed', handleSidebarClose);
    };
  }, []);

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
      disableEnforceFocus
    >
      <ModalPositioner $sidebarOpen={sidebarOpen}>
        <Box className="bg-white" style={styles}>
          <CloseButton onClick={handleClose}>
            <CloseIcon className={styles?.closeButtonColor} />
          </CloseButton>

          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Box className="overflow-auto" style={{ maxHeight: '95vh' }}>
            {children}
          </Box>
        </Box>
      </ModalPositioner>
    </Modal>
  );
};

export default PopUp;
