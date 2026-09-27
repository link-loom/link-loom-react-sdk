import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import {
  AddOutlined as AddIcon,
  DeleteOutlineOutlined as DeleteIcon,
  OpenInNewOutlined as OpenInNewIcon,
} from '@mui/icons-material';
import {
  EMPTY_EVIDENCE_DRAFT,
  EVIDENCE_LIST_LABELS,
  buildEvidencePiece,
  evidenceTitleOf,
  formatEvidenceTimestamp,
  isOpenableLink,
} from './evidenceList.helpers.js';

const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/**
 * What backs a record: a list you add to, one piece at a time. Each piece says what it is, where it
 * lives and a line about it, and carries who attached it and when. The list owns no persistence: the
 * detail writes each change to the record (`onAttach(piece)`; answering `false` keeps the draft), the
 * create form keeps them until the record exists, and removing asks first in the caller
 * (`onRemove(piece, index)`), because the trail is the reason the list exists.
 */
function EvidenceList({
  pieces = [],
  editable = false,
  actor = null,
  onAttach,
  onRemove,
  onOpenLink = openInNewTab,
  formatTimestamp = formatEvidenceTimestamp,
  labels,
  sx,
}) {
  // -----------------------------------------------------
  // 1. Models / State
  // -----------------------------------------------------
  const [draft, setDraft] = useState(EMPTY_EVIDENCE_DRAFT);

  // -----------------------------------------------------
  // 2. UI States
  // -----------------------------------------------------
  const [attaching, setAttaching] = useState(false);
  const [labelMissing, setLabelMissing] = useState(false);

  // -----------------------------------------------------
  // 3. Configs / Constants
  // -----------------------------------------------------
  const resolvedLabels = { ...EVIDENCE_LIST_LABELS, ...labels };

  // -----------------------------------------------------
  // 4. Component Functions
  // -----------------------------------------------------
  const setDraftField = (field) => (event) => {
    const { value } = event.target;
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (field === 'label' && value.trim()) {
      setLabelMissing(false);
    }
  };

  const attach = async () => {
    const piece = buildEvidencePiece(draft, actor);
    if (!piece) {
      setLabelMissing(true);
      return;
    }

    // A write that fails keeps the draft: the caller reports the failure, the person keeps what they typed.
    setAttaching(true);
    const attached = await Promise.resolve()
      .then(() => onAttach?.(piece))
      .catch(() => false);
    setAttaching(false);

    if (attached !== false) {
      setDraft(EMPTY_EVIDENCE_DRAFT);
    }
  };

  // -----------------------------------------------------
  // 5. Render
  // -----------------------------------------------------
  return (
    <Box sx={sx}>
      {pieces.length ? (
        pieces.map((piece, index) => (
          <Box
            key={piece.id || piece.url || index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1.25,
              mb: 0.75,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              minWidth: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ wordBreak: 'break-word' }}>
                {evidenceTitleOf(piece)}
              </Typography>
              {piece.note && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {piece.note}
                </Typography>
              )}
              {piece.added_by?.name && (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.tertiary', display: 'block', mt: 0.25 }}
                >
                  {resolvedLabels.addedBy(piece.added_by.name, formatTimestamp(piece.added_at))}
                </Typography>
              )}
            </Box>

            {isOpenableLink(piece.url) && (
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={<OpenInNewIcon />}
                onClick={() => onOpenLink(piece.url.trim())}
                sx={{ flexShrink: 0 }}
              >
                {resolvedLabels.open}
              </Button>
            )}

            {editable && (
              <Tooltip title={resolvedLabels.remove}>
                <IconButton
                  size="small"
                  aria-label={resolvedLabels.remove}
                  onClick={() => onRemove?.(piece, index)}
                  sx={{ flexShrink: 0 }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body2" sx={{ color: 'text.tertiary' }}>
          {resolvedLabels.empty}
        </Typography>
      )}

      {editable && (
        <Box sx={{ mt: 2, pt: 2, borderTop: pieces.length ? 1 : 0, borderColor: 'divider' }}>
          <Typography variant="overline" sx={{ color: 'text.tertiary', display: 'block' }}>
            {resolvedLabels.add}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.tertiary', display: 'block', mb: 1.5 }}>
            {resolvedLabels.hint}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
              gap: 1.5,
            }}
          >
            <TextField
              size="small"
              label={resolvedLabels.label}
              value={draft.label}
              onChange={setDraftField('label')}
              error={labelMissing}
              helperText={labelMissing ? resolvedLabels.labelRequired : undefined}
            />
            <TextField
              size="small"
              label={resolvedLabels.link}
              value={draft.url}
              onChange={setDraftField('url')}
            />
          </Box>

          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={resolvedLabels.note}
            value={draft.note}
            onChange={setDraftField('note')}
            sx={{ mt: 1.5 }}
          />

          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={attach}
            disabled={attaching}
            sx={{ mt: 1.5 }}
          >
            {resolvedLabels.attach}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default EvidenceList;
