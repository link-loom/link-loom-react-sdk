import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Divider, ListSubheader, Menu, MenuItem, Tooltip } from '@mui/material';
import {
  AddOutlined as AddIcon,
  DragIndicatorOutlined as DragIcon,
  ContentCopyOutlined as DuplicateIcon,
  DeleteOutlineOutlined as DeleteIcon,
} from '@mui/icons-material';
import {
  availableBlockTypes,
  canTurnBlockInto,
  deleteBlock,
  duplicateBlock,
  insertBlockBelow,
  turnBlockInto,
} from './extensions/block-actions.js';

const HIDDEN = { visible: false, blockIndex: -1, top: 0, left: 0 };

const subheaderSx = {
  lineHeight: '24px',
  px: 1,
  fontSize: 'var(--stos-fs-11, 11px)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--stos-text-tertiary, #737f94)',
  backgroundColor: 'transparent',
};

// "+" (insert below, opens the slash menu) and the drag grip (drag to move, click for the block menu).
// Rendered into the editor container so hovering it counts as hovering the block.
function BlockGutter({ editor, labels }) {
  // -----------------------------------------------------
  // 1. State
  // -----------------------------------------------------
  const [handle, setHandle] = useState(HIDDEN);
  const [menu, setMenu] = useState(null);
  const controller = editor?.storage?.blockDragHandle?.controller;
  const container = controller && !editor.isDestroyed ? controller.host : null;

  // -----------------------------------------------------
  // 2. Handlers
  // -----------------------------------------------------
  const closeMenu = () => {
    setMenu(null);
    controller?.setPinned(false);
  };

  const runOnBlock = (action) => {
    const blockIndex = menu?.blockIndex ?? handle.blockIndex;
    setMenu(null);
    controller?.setPinned(false);
    action(editor, blockIndex);
  };

  const openMenu = (event) => {
    controller?.setPinned(true);
    setMenu({ anchor: event.currentTarget, blockIndex: handle.blockIndex });
  };

  // -----------------------------------------------------
  // 3. Lifecycle
  // -----------------------------------------------------
  useEffect(() => (controller ? controller.subscribe(setHandle) : undefined), [controller]);

  useEffect(() => {
    controller?.bindContainer();
  });

  // -----------------------------------------------------
  // 4. Render
  // -----------------------------------------------------
  if (!container || !editor.isEditable) {
    return null;
  }

  const turnIntoEnabled = menu ? canTurnBlockInto(editor, menu.blockIndex) : false;
  const visible = handle.visible || Boolean(menu);

  return createPortal(
    <div
      className="stos-block-gutter"
      data-block-gutter=""
      data-visible={visible ? 'true' : 'false'}
      style={{ top: handle.top, left: handle.left }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <Tooltip title={labels.blockAddBelow} placement="bottom" disableInteractive>
        <button
          type="button"
          className="stos-block-gutter__button"
          aria-label={labels.blockAddBelow}
          data-block-add=""
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            insertBlockBelow(editor, handle.blockIndex);
            controller.publish(HIDDEN);
          }}
        >
          <AddIcon />
        </button>
      </Tooltip>
      <Tooltip title={labels.blockDragHandle} placement="bottom" disableInteractive>
        <button
          type="button"
          draggable
          className="stos-block-gutter__button stos-block-gutter__grip"
          aria-label={labels.blockDragHandle}
          aria-haspopup="menu"
          aria-expanded={menu ? 'true' : 'false'}
          data-drag-handle=""
          onMouseDown={(event) => event.stopPropagation()}
          onDragStart={(event) => controller.startDrag(event.nativeEvent)}
          onDragEnd={() => controller.endDrag()}
          onClick={openMenu}
        >
          <DragIcon />
        </button>
      </Tooltip>

      <Menu
        anchorEl={menu?.anchor || null}
        open={Boolean(menu)}
        onClose={closeMenu}
        disableScrollLock
        disableAutoFocusItem
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ className: 'stos-row-menu stos-block-menu', 'aria-label': labels.blockMenu }}
      >
        <ListSubheader disableSticky sx={subheaderSx}>
          {labels.blockTurnInto}
        </ListSubheader>
        {availableBlockTypes(editor).map((type) => {
          const Icon = type.icon;
          return (
            <MenuItem
              key={type.id}
              disabled={!turnIntoEnabled}
              data-block-type={type.id}
              onClick={() => runOnBlock((current, blockIndex) => turnBlockInto(current, blockIndex, type.id))}
            >
              <Icon />
              {labels[type.id]}
            </MenuItem>
          );
        })}
        <Divider component="li" sx={{ my: 0.5 }} />
        <MenuItem data-block-action="duplicate" onClick={() => runOnBlock(duplicateBlock)}>
          <DuplicateIcon />
          {labels.blockDuplicate}
        </MenuItem>
        <MenuItem data-block-action="delete" className="stos-action--danger" onClick={() => runOnBlock(deleteBlock)}>
          <DeleteIcon />
          {labels.blockDelete}
        </MenuItem>
      </Menu>
    </div>,
    container,
  );
}

export default BlockGutter;
