import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box, ButtonBase, Paper, Popper } from '@mui/material';
import { MODAL_ROOT_CLASS, editorOverlayZIndex } from '../../overlayLayer.js';

const menuPaperSx = {
  width: 240,
  maxHeight: 320,
  overflowY: 'auto',
  p: 0.5,
  borderRadius: 'var(--stos-radius-md, 8px)',
  border: '1px solid var(--stos-border, #e4e8ef)',
  backgroundColor: 'var(--stos-bg-surface, #ffffff)',
  boxShadow: 'var(--stos-shadow-md)',
};

const itemSx = (selected) => ({
  width: '100%',
  minHeight: 30,
  px: 1,
  gap: 1.25,
  justifyContent: 'flex-start',
  borderRadius: 'var(--stos-radius-sm, 6px)',
  fontFamily: 'var(--stos-font-ui)',
  fontSize: 'var(--stos-fs-13, 13px)',
  color: 'var(--stos-menu-text, rgb(32, 32, 32))',
  backgroundColor: selected ? 'var(--stos-bg-selected, #eceff5)' : 'transparent',
  transition: 'background-color var(--stos-motion-fast, 120ms) ease-in-out',
  '&:hover': { backgroundColor: 'var(--stos-bg-hover, #f2f4f8)' },
  '& .MuiSvgIcon-root': { fontSize: 16, color: 'var(--stos-menu-icon, rgb(131, 131, 131))' },
});

const SlashCommandMenu = forwardRef(function SlashCommandMenu({ editor, items, command, clientRect, open = true, labels }, ref) {
  // -----------------------------------------------------
  // 1. State
  // -----------------------------------------------------
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // -----------------------------------------------------
  // 2. Derived
  // -----------------------------------------------------
  const anchorEl = useMemo(
    () => (clientRect ? { getBoundingClientRect: () => clientRect() || new DOMRect() } : null),
    [clientRect],
  );
  // Inside a dialog the menu must live in the dialog's own layer, otherwise the modal surface paints over it.
  const container = useMemo(() => editor?.view?.dom?.closest(`.${MODAL_ROOT_CLASS}`) || undefined, [editor]);

  // -----------------------------------------------------
  // 3. Handlers
  // -----------------------------------------------------
  const selectItem = (index) => {
    const item = items[index];
    if (!item) {
      return;
    }
    command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (!items.length) {
        return false;
      }
      if (event.key === 'ArrowUp') {
        setSelectedIndex((index) => (index + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((index) => (index + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  // -----------------------------------------------------
  // 4. Lifecycle
  // -----------------------------------------------------
  useEffect(() => setSelectedIndex(0), [items]);

  useEffect(() => {
    const selected = listRef.current?.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // -----------------------------------------------------
  // 5. Render
  // -----------------------------------------------------
  return (
    <Popper
      open={Boolean(open && anchorEl)}
      anchorEl={anchorEl}
      container={container}
      placement="bottom-start"
      className="stos-slash-menu"
      sx={(theme) => ({ zIndex: editorOverlayZIndex(theme) })}
      modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
    >
      <Paper ref={listRef} elevation={0} sx={menuPaperSx} role="listbox" onMouseDown={(event) => event.preventDefault()}>
        {items.length === 0 && (
          <Box sx={{ px: 1, py: 0.75, fontSize: 'var(--stos-fs-12, 12px)', color: 'var(--stos-text-tertiary, #737f94)' }}>
            {labels.noResults}
          </Box>
        )}
        {items.map((item, index) => {
          const Icon = item.icon;
          const selected = index === selectedIndex;
          return (
            <ButtonBase
              key={item.id}
              role="option"
              aria-selected={selected}
              data-selected={selected ? 'true' : 'false'}
              data-slash-item={item.id}
              sx={itemSx(selected)}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => selectItem(index)}
            >
              <Icon />
              <span>{item.label}</span>
            </ButtonBase>
          );
        })}
      </Paper>
    </Popper>
  );
});

export default SlashCommandMenu;
