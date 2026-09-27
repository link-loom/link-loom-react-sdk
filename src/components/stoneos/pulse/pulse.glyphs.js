import {
  AddOutlined as CreatedIcon,
  AltRouteOutlined as DispatchedIcon,
  CallSplitOutlined as ReferredIcon,
  CancelOutlined as RejectedIcon,
  CheckCircleOutlined as ApprovedIcon,
  DeleteOutlineOutlined as DeletedIcon,
  EditOutlined as UpdatedIcon,
  ForwardOutlined as TransferredIcon,
  HistoryOutlined as DefaultIcon,
  Inventory2Outlined as ArchivedIcon,
  PanToolOutlined as TakenIcon,
  PersonOutlined as AssignedIcon,
  RateReviewOutlined as ReviewRequestedIcon,
  RestoreOutlined as RestoredIcon,
  SubdirectoryArrowRightOutlined as SubtaskIcon,
  SwapHorizOutlined as MovedIcon,
  TaskAltOutlined as DerivedCompletedIcon,
  UnarchiveOutlined as UnarchivedIcon,
} from '@mui/icons-material';
import { resolveStatePresentation } from '../theme/presentation.js';
import { PULSE_ACTIONS, PULSE_CHANGE_KINDS, actionOf, changesOf } from './pulse.helpers.js';

const NEUTRAL_COLOR = 'var(--stos-text-secondary)';
const DANGER_COLOR = 'var(--stos-danger)';
const SUCCESS_COLOR = 'var(--stos-success)';

const ACTION_GLYPHS = {
  [PULSE_ACTIONS.created]: CreatedIcon,
  [PULSE_ACTIONS.updated]: UpdatedIcon,
  [PULSE_ACTIONS.assigned]: AssignedIcon,
  [PULSE_ACTIONS.stateChanged]: MovedIcon,
  [PULSE_ACTIONS.subtaskAdded]: SubtaskIcon,
  [PULSE_ACTIONS.archived]: ArchivedIcon,
  [PULSE_ACTIONS.unarchived]: UnarchivedIcon,
  [PULSE_ACTIONS.restored]: RestoredIcon,
  [PULSE_ACTIONS.deleted]: DeletedIcon,
  [PULSE_ACTIONS.dispatched]: DispatchedIcon,
  [PULSE_ACTIONS.transferred]: TransferredIcon,
  [PULSE_ACTIONS.referred]: ReferredIcon,
  [PULSE_ACTIONS.derivedCompleted]: DerivedCompletedIcon,
  [PULSE_ACTIONS.taken]: TakenIcon,
  [PULSE_ACTIONS.reviewRequested]: ReviewRequestedIcon,
  [PULSE_ACTIONS.approved]: ApprovedIcon,
  [PULSE_ACTIONS.rejected]: RejectedIcon,
};

const COLORED_ACTIONS = {
  [PULSE_ACTIONS.deleted]: DANGER_COLOR,
  [PULSE_ACTIONS.rejected]: DANGER_COLOR,
  [PULSE_ACTIONS.derivedCompleted]: SUCCESS_COLOR,
  [PULSE_ACTIONS.approved]: SUCCESS_COLOR,
};

/**
 * The small mark that says what kind of change a line is. Neutral by default; a move takes the colour
 * of the stage it landed on, a deletion or a rejection the danger colour and an approval or work that
 * came back done the success colour: the cases where the colour carries meaning.
 */
export const pulseGlyphOf = (entry) => {
  const action = actionOf(entry);
  const Icon = ACTION_GLYPHS[action] || DefaultIcon;

  if (COLORED_ACTIONS[action]) {
    return { Icon, color: COLORED_ACTIONS[action] };
  }

  if (action === PULSE_ACTIONS.stateChanged) {
    const stage = changesOf(entry).find((change) => change.kind === PULSE_CHANGE_KINDS.stage);
    const presentation = resolveStatePresentation(
      stage?.to || entry?.payload?.to_stage,
      entry?.payload?.to_status,
    );
    return { Icon, color: presentation?.color || NEUTRAL_COLOR };
  }

  return { Icon, color: NEUTRAL_COLOR };
};
