import React from 'react';
import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  KeyboardDoubleArrowLeft as CollapseIcon,
  KeyboardDoubleArrowRight as ExpandIcon,
} from '@mui/icons-material';
import useSidebarCondensed from './useSidebarCondensed.hook.js';
import { toggleSidebar } from './sidebar-toggle.js';

// Adminto turns the sidebar into a drawer below this width; the navbar's menu button closes it.
const DRAWER_MAX_WIDTH = 992.98;

// Structure only. The look (hover, focus, sizes next to a rail) belongs to whoever styles the sidebar,
// through the stable `ll-sidebar-toggle` class.
const ToggleButton = styled('button')({
  position: 'absolute',
  top: '50%',
  right: 14,
  transform: 'translateY(-50%)',
  display: 'grid',
  placeItems: 'center',
  width: 26,
  height: 26,
  padding: 0,
  border: 0,
  borderRadius: 4,
  background: 'transparent',
  color: '#6c757d',
  cursor: 'pointer',
  '& svg': { fontSize: 16 },
  '&.ll-sidebar-toggle--rail': { position: 'static', transform: 'none' },
  [`@media (max-width: ${DRAWER_MAX_WIDTH}px)`]: { display: 'none' },
});

/**
 * Condenses and expands the whole sidebar. Expanded it sits at the right of the row that carries it;
 * condensed it takes the `ll-sidebar-toggle--rail` modifier and stands alone in the flow.
 */
function SidebarCollapseToggle({ collapseLabel = 'Collapse sidebar', expandLabel = 'Expand sidebar' }) {
  const isCondensed = useSidebarCondensed();
  const label = isCondensed ? expandLabel : collapseLabel;

  const handleClick = (event) => {
    event.stopPropagation();
    toggleSidebar();
  };

  return (
    <Tooltip title={label} placement="right">
      <ToggleButton
        type="button"
        className={`ll-sidebar-toggle${isCondensed ? ' ll-sidebar-toggle--rail' : ''}`}
        aria-label={label}
        aria-expanded={!isCondensed}
        onClick={handleClick}
      >
        {isCondensed ? <ExpandIcon /> : <CollapseIcon />}
      </ToggleButton>
    </Tooltip>
  );
}

export default SidebarCollapseToggle;
