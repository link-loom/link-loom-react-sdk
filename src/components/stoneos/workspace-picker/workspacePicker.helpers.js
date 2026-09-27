import { colorFromString } from '../theme/stoneos.constants.js';

export const WORKSPACE_PICKER_LABELS = {
  label: 'Workspace',
  placeholder: 'Pick a workspace',
  loading: 'Loading the workspaces…',
  loadFailed: 'Could not load the workspaces',
  noMatch: 'No workspace matches',
  lockedScope: 'You can send work to it, not see its content',
  intake: 'Intake',
};

// A system workspace is the organization's intake: it cannot be deleted and keeps a glyph of its own.
export const WORKSPACE_SYSTEM_KIND = 'intake';

// The name the backend gives an intake until the organization renames it.
export const WORKSPACE_INTAKE_DEFAULT_NAME = 'Intake';

export const isSystemWorkspace = (workspace) => workspace?.kind?.name === WORKSPACE_SYSTEM_KIND;

/** Colour, icon name and initial of a workspace's square (`ui.color`/`ui.icon`, or the older `ui.emoji`). */
export const resolveWorkspaceUi = (workspace) => {
  const ui = workspace?.ui || {};
  const nested = ui.emoji || {};
  const color =
    ui.color ||
    nested.color ||
    colorFromString(workspace?.id || workspace?.slug || workspace?.name);
  const icon = ui.icon || nested.icon || null;
  const initial = String(workspace?.name || workspace?.slug || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
  return { color, icon, initial };
};

/**
 * The name a workspace is read by. An intake that still carries the name the backend gave it reads as
 * the intake in the active language; once the organization renames it, the stored name wins.
 */
export const workspaceNameOf = (workspace, labels = WORKSPACE_PICKER_LABELS) => {
  if (!workspace) {
    return '';
  }
  const stored = String(workspace.name || '').trim();
  if (isSystemWorkspace(workspace) && (!stored || stored === WORKSPACE_INTAKE_DEFAULT_NAME)) {
    return labels.intake;
  }
  return stored || workspace.slug || '';
};

/** The closed field's text: the name, with the slug while choosing (`showSlug`). */
export const workspaceOptionLabel = (
  workspace,
  { showSlug = true, labels = WORKSPACE_PICKER_LABELS } = {},
) => {
  if (!workspace) {
    return '';
  }
  const name = workspaceNameOf(workspace, labels);
  if (!showSlug) {
    return name || workspace.id || '';
  }
  return name ? `${name} (${workspace.slug || workspace.id})` : workspace.id || '';
};

/**
 * The selected workspace, preferred from the fetched list (most up to date), then from the snapshot the
 * record kept (`context.workspace`), so the field still shows the name while the list loads or when the
 * workspace lives outside it.
 */
export const selectedWorkspaceOf = ({ workspaces = [], value, valueSnapshot }) => {
  if (!value) {
    return null;
  }
  const fromList = workspaces.find((workspace) => workspace.id === value);
  if (fromList) {
    return fromList;
  }
  if (valueSnapshot) {
    return { ...valueSnapshot, id: value };
  }
  return { id: value };
};
