import React, { useEffect, useReducer, useRef, useState } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import { Box, ButtonBase, Divider, InputBase, Tooltip, useTheme } from '@mui/material';
import {
  FormatBoldOutlined as BoldIcon,
  FormatItalicOutlined as ItalicIcon,
  FormatUnderlinedOutlined as UnderlineIcon,
  StrikethroughSOutlined as StrikeIcon,
  CodeOutlined as InlineCodeIcon,
  LinkOutlined as LinkIcon,
  LinkOffOutlined as UnlinkIcon,
  FormatColorTextOutlined as ColorIcon,
  KeyboardArrowDownOutlined as ChevronIcon,
  CheckOutlined as CheckIcon,
  FormatColorResetOutlined as ResetIcon,
} from '@mui/icons-material';
import ShortcutKeys from '../shortcut-keys/ShortcutKeys.component.jsx';
import { STOS_CARD_COLORS } from '../theme/stoneos.constants.js';
import { activeBlockType, applyBlockType, availableBlockTypes } from './extensions/block-actions.js';
import { MODAL_ROOT_CLASS, editorOverlayZIndex } from './overlayLayer.js';
import { OPEN_LINK_EVENT } from './extensions/link-shortcut.extension.js';

const PALETTE_KEYS = ['coral', 'amber', 'green', 'cyan', 'blue', 'indigo', 'purple', 'pink'];
const HIGHLIGHT_ALPHA = 0.3;

const hexToRgba = (hex, alpha) => {
  const value = hex.replace('#', '');
  const channel = (offset) => parseInt(value.slice(offset, offset + 2), 16);
  return `rgba(${channel(0)}, ${channel(2)}, ${channel(4)}, ${alpha})`;
};

export const TEXT_COLOR_OPTIONS = PALETTE_KEYS.map((key) => ({ id: key, value: STOS_CARD_COLORS[key] }));
export const HIGHLIGHT_COLOR_OPTIONS = PALETTE_KEYS.map((key) => ({ id: key, value: hexToRgba(STOS_CARD_COLORS[key], HIGHLIGHT_ALPHA) }));

const MARKS = [
  { id: 'bold', icon: BoldIcon, shortcut: 'mod+b', command: 'toggleBold' },
  { id: 'italic', icon: ItalicIcon, shortcut: 'mod+i', command: 'toggleItalic' },
  { id: 'underline', icon: UnderlineIcon, shortcut: 'mod+u', command: 'toggleUnderline' },
  { id: 'strike', icon: StrikeIcon, shortcut: 'mod+shift+s', command: 'toggleStrike' },
  { id: 'code', icon: InlineCodeIcon, shortcut: 'mod+e', command: 'toggleCode' },
];

const toolbarSx = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  p: '4px',
  fontFamily: 'var(--stos-font-ui)',
  fontSize: 'var(--stos-fs-13, 13px)',
  color: 'var(--stos-text-primary, #1b2233)',
  backgroundColor: 'var(--stos-bg-surface, #ffffff)',
  border: '1px solid var(--stos-border, #e4e8ef)',
  borderRadius: 'var(--stos-radius-md, 8px)',
  boxShadow: 'var(--stos-shadow-md)',
};

const buttonSx = (active) => ({
  height: 28,
  minWidth: 28,
  px: '6px',
  gap: '2px',
  borderRadius: 'var(--stos-radius-sm, 6px)',
  fontFamily: 'var(--stos-font-ui)',
  fontSize: 'var(--stos-fs-13, 13px)',
  fontWeight: 500,
  color: active ? 'var(--stos-brand, #3c4876)' : 'var(--stos-text-secondary, #515d72)',
  backgroundColor: active ? 'var(--stos-bg-selected, #eceff5)' : 'transparent',
  transition: 'background-color var(--stos-motion-fast, 120ms) ease-in-out',
  '&:hover': { backgroundColor: 'var(--stos-bg-hover, #f2f4f8)' },
  '& .MuiSvgIcon-root': { fontSize: 18 },
});

const panelSx = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  zIndex: 1,
  p: '4px',
  backgroundColor: 'var(--stos-bg-surface, #ffffff)',
  border: '1px solid var(--stos-border, #e4e8ef)',
  borderRadius: 'var(--stos-radius-md, 8px)',
  boxShadow: 'var(--stos-shadow-md)',
};

const panelItemSx = (selected) => ({
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
  '&:hover': { backgroundColor: 'var(--stos-bg-hover, #f2f4f8)' },
  '& .MuiSvgIcon-root': { fontSize: 16, color: 'var(--stos-menu-icon, rgb(131, 131, 131))' },
});

const captionSx = {
  px: 1,
  pt: 0.5,
  pb: 0.25,
  fontSize: 'var(--stos-fs-11, 11px)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--stos-text-tertiary, #737f94)',
};

const swatchSx = (selected) => ({
  width: 24,
  height: 24,
  borderRadius: 'var(--stos-radius-sm, 6px)',
  border: '1px solid var(--stos-border, #e4e8ef)',
  fontWeight: 600,
  fontSize: 'var(--stos-fs-13, 13px)',
  boxShadow: selected ? '0 0 0 2px var(--stos-brand, #3c4876)' : 'none',
  '& .MuiSvgIcon-root': { fontSize: 14 },
});

const TooltipTitle = ({ label, shortcut }) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
    {label}
    {shortcut && <ShortcutKeys combo={shortcut} />}
  </Box>
);

const keepEditorFocus = (event) => event.preventDefault();

const EMAIL_PATTERN = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/;

// "example.com" → "https://example.com", "ana@acme.com" → "mailto:ana@acme.com"; schemes and anchors stay.
const normalizeHref = (value) => {
  const href = value.trim();
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('/') || href.startsWith('#')) {
    return href;
  }
  return EMAIL_PATTERN.test(href) ? `mailto:${href}` : `https://${href}`;
};

const shouldShowToolbar = ({ editor, view, state, from, to, element }) => {
  if (!editor.isEditable || from === to || state.selection instanceof NodeSelection) {
    return false;
  }
  if (editor.isActive('codeBlock') || !state.doc.textBetween(from, to, ' ').trim()) {
    return false;
  }
  return view.hasFocus() || element.contains(document.activeElement);
};

// Floating toolbar over a text selection: block type, marks, link and colors. Opened panels render
// inside the toolbar so focusing the link input does not dismiss it.
function SelectionToolbar({ editor, labels }) {
  // -----------------------------------------------------
  // 1. State
  // -----------------------------------------------------
  const theme = useTheme();
  const [panel, setPanel] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [, forceRender] = useReducer((count) => count + 1, 0);
  const linkInputRef = useRef(null);

  // -----------------------------------------------------
  // 2. Derived
  // -----------------------------------------------------
  const hasTextColor = typeof editor?.commands?.setColor === 'function';
  const hasHighlight = typeof editor?.commands?.setHighlight === 'function';
  const hasLink = typeof editor?.commands?.setLink === 'function';
  const currentType = editor ? activeBlockType(editor) : null;
  const currentTextColor = editor?.getAttributes('textStyle')?.color || null;
  const currentHighlight = editor?.getAttributes('highlight')?.color || null;

  // -----------------------------------------------------
  // 3. Handlers
  // -----------------------------------------------------
  const togglePanel = (panelId) => setPanel((current) => (current === panelId ? null : panelId));

  const openLinkPanel = () => {
    setLinkUrl(editor.getAttributes('link')?.href || '');
    setPanel('link');
  };

  const applyLink = () => {
    const href = normalizeHref(linkUrl);
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!href) {
      chain.unsetLink().run();
    } else {
      chain.setLink({ href }).run();
    }
    setPanel(null);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setPanel(null);
  };

  const setTextColor = (value) => {
    const chain = editor.chain().focus();
    (value ? chain.setColor(value) : chain.unsetColor()).run();
    setPanel(null);
  };

  const setHighlightColor = (value) => {
    const chain = editor.chain().focus();
    (value ? chain.setHighlight({ color: value }) : chain.unsetHighlight()).run();
    setPanel(null);
  };

  // -----------------------------------------------------
  // 4. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    if (!editor) {
      return undefined;
    }
    const refresh = () => forceRender();
    const closePanels = () => setPanel(null);
    editor.on('transaction', refresh);
    editor.on('selectionUpdate', closePanels);
    return () => {
      editor.off('transaction', refresh);
      editor.off('selectionUpdate', closePanels);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || !hasLink) {
      return undefined;
    }
    editor.on(OPEN_LINK_EVENT, openLinkPanel);
    return () => editor.off(OPEN_LINK_EVENT, openLinkPanel);
  }, [editor, hasLink]);

  useEffect(() => {
    if (panel === 'link') {
      linkInputRef.current?.focus();
    }
  }, [panel]);

  // -----------------------------------------------------
  // 5. Render
  // -----------------------------------------------------
  if (!editor) {
    return null;
  }

  const renderSwatches = (options, current, onSelect, kind) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(9, 24px)', gap: '4px', px: 1, py: 0.5 }}>
      <Tooltip title={labels.colorDefault} disableInteractive>
        <ButtonBase
          aria-label={labels.colorDefault}
          aria-pressed={!current}
          data-color-kind={kind}
          data-color-id="default"
          onMouseDown={keepEditorFocus}
          onClick={() => onSelect(null)}
          sx={{ ...swatchSx(!current), color: 'var(--stos-text-tertiary, #737f94)' }}
        >
          <ResetIcon />
        </ButtonBase>
      </Tooltip>
      {options.map((option) => {
        const selected = current === option.value;
        const label = labels[`color_${option.id}`] || option.id;
        return (
          <Tooltip key={option.id} title={label} disableInteractive>
            <ButtonBase
              aria-label={label}
              aria-pressed={selected}
              data-color-kind={kind}
              data-color-id={option.id}
              onMouseDown={keepEditorFocus}
              onClick={() => onSelect(option.value)}
              sx={{
                ...swatchSx(selected),
                ...(kind === 'text' ? { color: option.value } : { backgroundColor: option.value, color: 'var(--stos-text-primary)' }),
              }}
            >
              {selected ? <CheckIcon /> : 'A'}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="stosSelectionToolbar"
      shouldShow={shouldShowToolbar}
      tippyOptions={{
        duration: 120,
        maxWidth: 'none',
        zIndex: editorOverlayZIndex(theme),
        appendTo: () => editor?.view?.dom?.closest(`.${MODAL_ROOT_CLASS}`) || document.body,
        placement: 'top-start',
        onHidden: () => setPanel(null),
      }}
    >
      <Box className="stos-selection-toolbar" data-stos-theme={theme.palette.mode} role="toolbar" aria-label={labels.toolbar} sx={toolbarSx}>
        <Tooltip title={labels.turnInto} disableInteractive>
          <ButtonBase
            aria-haspopup="listbox"
            aria-expanded={panel === 'blockType'}
            data-toolbar-action="blockType"
            onMouseDown={keepEditorFocus}
            onClick={() => togglePanel('blockType')}
            sx={{ ...buttonSx(false), pl: 1, color: 'var(--stos-text-primary, #1b2233)' }}
          >
            {labels[currentType.id]}
            <ChevronIcon />
          </ButtonBase>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: '2px' }} />

        {MARKS.filter((mark) => typeof editor.commands[mark.command] === 'function').map((mark) => {
          const Icon = mark.icon;
          const active = editor.isActive(mark.id);
          return (
            <Tooltip key={mark.id} title={<TooltipTitle label={labels[mark.id]} shortcut={mark.shortcut} />} disableInteractive>
              <ButtonBase
                aria-label={labels[mark.id]}
                aria-pressed={active}
                data-toolbar-action={mark.id}
                onMouseDown={keepEditorFocus}
                onClick={() => editor.chain().focus()[mark.command]().run()}
                sx={buttonSx(active)}
              >
                <Icon />
              </ButtonBase>
            </Tooltip>
          );
        })}

        {hasLink && (
          <Tooltip title={<TooltipTitle label={labels.link} shortcut="mod+k" />} disableInteractive>
            <ButtonBase
              aria-label={labels.link}
              aria-pressed={editor.isActive('link')}
              data-toolbar-action="link"
              onMouseDown={keepEditorFocus}
              onClick={() => (panel === 'link' ? setPanel(null) : openLinkPanel())}
              sx={buttonSx(editor.isActive('link'))}
            >
              <LinkIcon />
            </ButtonBase>
          </Tooltip>
        )}

        {(hasTextColor || hasHighlight) && (
          <Tooltip title={<TooltipTitle label={labels.color} shortcut={hasHighlight ? 'mod+shift+h' : null} />} disableInteractive>
            <ButtonBase
              aria-label={labels.color}
              aria-expanded={panel === 'color'}
              data-toolbar-action="color"
              onMouseDown={keepEditorFocus}
              onClick={() => togglePanel('color')}
              sx={buttonSx(Boolean(currentTextColor || currentHighlight))}
            >
              <ColorIcon sx={{ color: currentTextColor || undefined }} />
            </ButtonBase>
          </Tooltip>
        )}

        {panel === 'blockType' && (
          <Box sx={{ ...panelSx, width: 200 }} role="listbox" aria-label={labels.turnInto}>
            {availableBlockTypes(editor).map((type) => {
              const Icon = type.icon;
              const selected = type.id === currentType.id;
              return (
                <ButtonBase
                  key={type.id}
                  role="option"
                  aria-selected={selected}
                  data-block-type={type.id}
                  onMouseDown={keepEditorFocus}
                  onClick={() => {
                    applyBlockType(editor, type.id);
                    setPanel(null);
                  }}
                  sx={panelItemSx(selected)}
                >
                  <Icon />
                  <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
                    {labels[type.id]}
                  </Box>
                  {selected && <CheckIcon />}
                </ButtonBase>
              );
            })}
          </Box>
        )}

        {panel === 'link' && (
          <Box sx={{ ...panelSx, display: 'flex', alignItems: 'center', gap: 0.5, width: 320 }}>
            <InputBase
              inputRef={linkInputRef}
              value={linkUrl}
              placeholder={labels.linkPlaceholder}
              inputProps={{ 'aria-label': labels.link, 'data-link-input': '' }}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyLink();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setPanel(null);
                  editor.commands.focus();
                }
              }}
              sx={{
                flex: 1,
                height: 28,
                px: 1,
                fontSize: 'var(--stos-fs-13, 13px)',
                border: '1px solid var(--stos-border, #e4e8ef)',
                borderRadius: 'var(--stos-radius-sm, 6px)',
                '&.Mui-focused': { borderColor: 'var(--stos-brand, #3c4876)' },
              }}
            />
            <ButtonBase onMouseDown={keepEditorFocus} onClick={applyLink} data-link-apply="" sx={{ ...buttonSx(false), color: 'var(--stos-brand, #3c4876)' }}>
              {labels.linkApply}
            </ButtonBase>
            {editor.isActive('link') && (
              <Tooltip title={labels.linkRemove} disableInteractive>
                <ButtonBase aria-label={labels.linkRemove} onMouseDown={keepEditorFocus} onClick={removeLink} sx={buttonSx(false)}>
                  <UnlinkIcon />
                </ButtonBase>
              </Tooltip>
            )}
          </Box>
        )}

        {panel === 'color' && (
          <Box sx={{ ...panelSx, left: 'auto', right: 0 }}>
            {hasTextColor && (
              <>
                <Box sx={captionSx}>{labels.textColor}</Box>
                {renderSwatches(TEXT_COLOR_OPTIONS, currentTextColor, setTextColor, 'text')}
              </>
            )}
            {hasHighlight && (
              <>
                <Box sx={captionSx}>{labels.highlight}</Box>
                {renderSwatches(HIGHLIGHT_COLOR_OPTIONS, currentHighlight, setHighlightColor, 'highlight')}
              </>
            )}
          </Box>
        )}
      </Box>
    </BubbleMenu>
  );
}

export default SelectionToolbar;
