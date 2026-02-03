import React, { useState } from 'react';
import { Paper, IconButton, InputBase } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SearchRoot = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  maxWidth: '400px',
  padding: '1px 8px',
  boxShadow: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  borderRadius: '8px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
}));

const SearchIconButton = styled(IconButton)({
  padding: '6px',
  color: 'rgba(255, 255, 255, 0.85)',
  '&:hover': {
    color: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'transparent',
  },
});

const SearchInput = styled(InputBase)({
  marginLeft: '4px',
  flex: 1,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 400,
  '& .MuiInputBase-input': {
    padding: '4px 0',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.65)',
      opacity: 1,
    },
  },
});

function OmniSearchTrigger({ onClick }) {
  const [shortcutLabel, setShortcutLabel] = React.useState('Cmd+K');

  React.useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      (navigator.userAgentData?.platform === 'macOS' || /Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
    setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  return (
    <SearchRoot component="div" onClick={onClick}>
      <SearchIconButton type="button" aria-label="search">
        <SearchIcon />
      </SearchIconButton>
      <SearchInput placeholder={`Search (${shortcutLabel})`} inputProps={{ 'aria-label': 'search', readOnly: true }} />
    </SearchRoot>
  );
}

export default OmniSearchTrigger;
