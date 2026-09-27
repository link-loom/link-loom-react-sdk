import React from 'react';
import { Box, Typography } from '@mui/material';
import StatusPill from '../../status-pill/StatusPill.component.jsx';
import PriorityPill from '../../priority-pill/PriorityPill.component.jsx';
import TypeTag from '../../type-tag/TypeTag.component.jsx';
import { PULSE_CHANGE_KINDS, formatPulseDate } from '../pulse.helpers.js';
import PulseAvatar from './PulseAvatar.component.jsx';

// What was: struck through and quiet. What is: marked, the one thing on the line that reads first.
const BEFORE_SX = {
  color: 'text.tertiary',
  textDecoration: 'line-through',
  textDecorationColor: 'var(--stos-text-tertiary)',
};
const AFTER_SX = { color: 'text.primary', fontWeight: 500 };
const AFTER_MARK_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
  maxWidth: '100%',
  backgroundColor: 'var(--stos-accent-tint)',
  borderRadius: 1,
  px: 0.75,
  py: 0.25,
  color: 'inherit',
};
const CHIP_BEFORE_SX = { opacity: 0.55, textDecoration: 'line-through' };

const isEmptyValue = (value) => value === null || value === undefined || value === '';

const plainTextOf = (value) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const labelOf = (value) =>
  value && typeof value === 'object' ? value.title || value.name || '' : String(value);

/**
 * One side of one change, read-only: the value before (struck through) or after (highlighted), drawn
 * the way the rest of the kit draws that kind of value — a person with their avatar, a stage as its
 * coloured chip, a date in words. `presentation.renderValue({ change, side, value })` draws a kind of
 * the app's own; answering `undefined` falls back to these.
 */
function PulseChangeValue({ change, side, presentation }) {
  // -----------------------------------------------------
  // 1. Configs / Constants
  // -----------------------------------------------------
  const { labels, locale, timeZone, renderValue, resolveReference, resolvePerson } = presentation;
  const isBefore = side === 'before';
  const value = isBefore ? change?.from : change?.to;
  const sideSx = isBefore ? BEFORE_SX : AFTER_SX;
  const chipSx = isBefore ? CHIP_BEFORE_SX : {};

  // -----------------------------------------------------
  // 2. Component Functions
  // -----------------------------------------------------
  const text = (label) => (
    <Typography
      component="span"
      variant="body1"
      sx={{ ...sideSx, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
    >
      {label}
    </Typography>
  );

  const renderPerson = () => {
    const person = resolvePerson?.(value) || {};
    const name = person.name || value?.name || labels.someone;

    return (
      <Box
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0, ...sideSx }}
      >
        <PulseAvatar
          name={person.name || value?.name}
          identity={value?.identity || value?.team_id}
          avatarUrl={person.avatarUrl}
          size={20}
          sx={isBefore ? { opacity: 0.6 } : {}}
        />
        <Box component="span">{name}</Box>
      </Box>
    );
  };

  const renderCatalog = () => {
    if (change.field === 'priority') {
      return <PriorityPill priority={value} size="sm" sx={{ px: 0, ...chipSx }} />;
    }
    if (change.field === 'type') {
      return <TypeTag type={value} size="sm" sx={chipSx} />;
    }
    return text(labelOf(value));
  };

  const renderKnownValue = () => {
    switch (change?.kind) {
      case PULSE_CHANGE_KINDS.person:
        return renderPerson();
      case PULSE_CHANGE_KINDS.stage:
        return <StatusPill stage={value} size="sm" sx={chipSx} />;
      case PULSE_CHANGE_KINDS.catalog:
        return renderCatalog();
      case PULSE_CHANGE_KINDS.date:
        return text(formatPulseDate(value, { locale, timeZone }) || labelOf(value));
      case PULSE_CHANGE_KINDS.reference:
        return text(resolveReference?.(change.field, value) || value?.title || labels.noValue);
      case PULSE_CHANGE_KINDS.flag:
        return text(value ? labels.yes : labels.no);
      case PULSE_CHANGE_KINDS.richText:
        return text(labels.quoted(plainTextOf(value)));
      default:
        return text(labelOf(value));
    }
  };

  const renderSide = () => {
    if (change?.kind === PULSE_CHANGE_KINDS.structured) {
      return isBefore ? null : text(labels.changed);
    }
    if (isEmptyValue(value)) {
      return (
        <Typography
          component="span"
          variant="body1"
          sx={{ ...sideSx, fontStyle: 'italic', fontWeight: 400 }}
        >
          {labels.noValue}
        </Typography>
      );
    }
    const custom = renderValue?.({ change, side, value });
    return custom === undefined ? renderKnownValue() : custom;
  };

  // -----------------------------------------------------
  // 3. Render
  // -----------------------------------------------------
  const content = renderSide();

  if (isBefore || !content) {
    return content;
  }

  return (
    <Box component="mark" sx={AFTER_MARK_SX}>
      {content}
    </Box>
  );
}

export default PulseChangeValue;
