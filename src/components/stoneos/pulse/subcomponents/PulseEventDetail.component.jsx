import React from 'react';
import { Box, Typography } from '@mui/material';
import { AppsOutlined as AppIcon, ArrowForwardOutlined as ArrowIcon } from '@mui/icons-material';
import OrganizationBadge from '../../organization-picker/OrganizationBadge.component.jsx';
import {
  PULSE_ACTIONS,
  PULSE_CHANGE_KINDS,
  actionOf,
  changesOf,
  formatFullTime,
  timestampOf,
  verbTitleOf,
} from '../pulse.helpers.js';
import PulseAvatar from './PulseAvatar.component.jsx';
import PulseGlyph from './PulseGlyph.component.jsx';
import PulseChangeValue from './PulseChangeValue.component.jsx';

const hasValue = (value) => value !== null && value !== undefined && value !== '';

/**
 * The selected event, in full and read-only: what happened, who did it, when, and every field it
 * changed, the value it had struck through and the value it got highlighted. `compact` stacks each
 * field's name over its values, for narrow containers.
 */
function PulseEventDetail({ entry, presentation, hiddenFields = null, compact = false }) {
  // -----------------------------------------------------
  // 1. Configs / Constants
  // -----------------------------------------------------
  const { labels, locale, timeZone, summarize, glyphOf } = presentation;
  const actorName = entry?.context?.actor_display_name || null;
  const timestamp = timestampOf(entry);
  const changes = changesOf(entry, hiddenFields);
  // A creation lists first values: there is no "before" to strike through.
  const isCreation = actionOf(entry) === PULSE_ACTIONS.created;
  // Work that crossed to (or came from) another organization names it, with its mark.
  const payload = entry?.payload || {};
  const counterpart =
    payload.target_organization ||
    (isCreation && payload.issuing_organization?.id !== entry?.organization_id
      ? payload.issuing_organization
      : null);
  const hasContext = Boolean(counterpart?.id || payload.reason);
  const columns = compact ? '1fr' : 'minmax(120px, 160px) minmax(0, 1fr)';

  // -----------------------------------------------------
  // 2. Render
  // -----------------------------------------------------
  return (
    <Box
      component="article"
      aria-live="polite"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <PulseGlyph entry={entry} glyphOf={glyphOf} size={24} />
        <Typography variant="h4" component="h3" sx={{ minWidth: 0 }}>
          {verbTitleOf(entry, labels)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <PulseAvatar name={actorName} identity={entry?.actor_identity} size={36} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: actorName ? 'text.primary' : 'text.secondary' }}
          >
            {actorName || labels.someone}
          </Typography>
          <Typography
            component="time"
            variant="body2"
            sx={{ display: 'block', color: 'text.secondary' }}
          >
            {formatFullTime(timestamp, { locale, timeZone })}
          </Typography>
        </Box>
      </Box>

      {entry?.source && (
        <Box
          component="span"
          sx={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            height: 22,
            px: 0.75,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 500,
            maxWidth: '100%',
          }}
        >
          <AppIcon sx={{ fontSize: 14 }} />
          {labels.fromApp(entry.source)}
        </Box>
      )}

      {hasContext && (
        <Box
          component="dl"
          sx={{ m: 0, display: 'grid', gridTemplateColumns: columns, columnGap: 2, rowGap: 1 }}
        >
          {counterpart?.id && (
            <>
              <Typography component="dt" variant="body2" sx={{ color: 'text.tertiary' }}>
                {labels.organization}
              </Typography>
              <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
                <OrganizationBadge
                  organization={counterpart}
                  size={20}
                  labels={{ unknown: labels.unknownOrganization }}
                />
              </Box>
            </>
          )}
          {payload.reason && (
            <>
              <Typography component="dt" variant="body2" sx={{ color: 'text.tertiary' }}>
                {labels.reason}
              </Typography>
              <Typography
                component="dd"
                variant="body2"
                sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {payload.reason}
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* A line that only says where work went has nothing else to list. */}
      {!(changes.length === 0 && hasContext) && (
        <Box component="section" sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Typography
            variant="overline"
            component="h4"
            sx={{ display: 'block', color: 'text.tertiary', mb: 1.5 }}
          >
            {labels.whatChanged}
          </Typography>

          {changes.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2">{summarize(entry)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                {labels.noFieldDetail}
              </Typography>
            </Box>
          ) : (
            <Box
              component="dl"
              sx={{
                m: 0,
                display: 'grid',
                gridTemplateColumns: columns,
                columnGap: 2,
                rowGap: compact ? 0.5 : 1.75,
              }}
            >
              {changes.map((change) => {
                const showBefore =
                  !isCreation &&
                  hasValue(change.from) &&
                  change.kind !== PULSE_CHANGE_KINDS.structured;

                return (
                  <React.Fragment key={change.field}>
                    <Typography
                      component="dt"
                      variant="body2"
                      sx={{
                        color: 'text.tertiary',
                        pt: compact ? 0 : 0.25,
                        mt: compact ? 1.25 : 0,
                      }}
                    >
                      {labels.fields?.[change.field] || change.field}
                    </Typography>
                    <Box
                      component="dd"
                      sx={{
                        m: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      {showBefore && (
                        <>
                          <Box
                            component="span"
                            aria-label={labels.before}
                            sx={{ display: 'inline-flex', minWidth: 0 }}
                          >
                            <PulseChangeValue
                              change={change}
                              side="before"
                              presentation={presentation}
                            />
                          </Box>
                          <ArrowIcon aria-hidden sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </>
                      )}
                      <Box
                        component="span"
                        aria-label={labels.after}
                        sx={{ display: 'inline-flex', minWidth: 0 }}
                      >
                        <PulseChangeValue
                          change={change}
                          side="after"
                          presentation={presentation}
                        />
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default PulseEventDetail;
