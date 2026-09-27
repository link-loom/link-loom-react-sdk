# StoneOS UI kit

The visual layer shared by StoneOS productivity apps. Values and components are ported 1:1 from
Mi Retail Workspaces; contract: `bsh.linkloom.cloud.app-engine.svc/docs/architecture/stoneos-productivity-suite.md` (section 8).

## Setup

```jsx
import { StoneOSThemeProvider } from '@link-loom/react-sdk';

<StoneOSThemeProvider mode="system">{/* 'system' | 'light' | 'dark' */}
  <App />
</StoneOSThemeProvider>;
```

The provider:

- injects `tokens.css` once as `<style data-stos-tokens>` (idempotent; the SDK's rollup build extracts
  imported CSS into `dist/styles.css`, which runtime hosts do not always load, so tokens ship inside JS);
- builds the MUI theme with `createStoneOSTheme({ mode })` and renders `<div class="stos-app" data-theme>`;
- follows `prefers-color-scheme` live when `mode="system"`.

MUI portals (menus, popovers, dialogs, poppers, drawers) render outside `.stos-app`. The theme sets
`data-stos-theme="light|dark"` on them through `defaultProps`, and the token set is also declared on
`[data-stos-theme]`, so `var(--stos-*)` resolves inside portals too: the theme-independent tokens (type,
sizes, radii, layout, motion) on every `[data-stos-theme]`, the colours on `[data-stos-theme='light']` and
`[data-stos-theme='dark']`. A token that is the same in both themes goes in the shared block, or a dark
portal will not have it.

## Tokens

- Every Mi Retail `--mr-*` token is available as `--stos-*` with identical light values. Deprecated
  Mi Retail aliases (`--mr-ink-*`, `--mr-coral-*`, `--ct-*`) were not ported.
- Dark set under `.stos-app[data-theme="dark"]`: surfaces `#11151f` / `#161b27` / `#1d2330`, borders
  `#2a3142`, text `#e7ebf3` / `#aab3c5` / `#7f8aa0`, brand `#8b9bd6`, brighter semantic hues.
- Extra tokens: `--stos-kbd-bg`, `--stos-kbd-text`, `--stos-motion-fast` (120ms).
- Both token blocks set `color-scheme` (`light` / `dark`), so scrollbars and native controls follow the
  kit's theme instead of the host page's.
- Host safe area: `--stos-host-fab-safe` (72px) is the width the host's Command Center FAB covers at the
  bottom-right corner. Apps reserve it as right padding on bottom bars whose right end touches that corner
  (`padding-right: var(--stos-host-fab-safe, 72px)`); the fallback keeps apps correct on older kits.
- Apps render inside a host container: never use `position: fixed` or `100vh`/`100vw` for in-app UI (it
  lands behind the host navbar, sidebars or FAB). Use `position: absolute`/`sticky` against the app root
  (`position: relative`), MUI Dialog/Popover portals, or the Fullscreen API on the app root element.
- JS mirrors: `STOS_COLORS`, `STOS_DARK_COLORS`, `STOS_CARD_COLORS`, `STOS_STATE_COLORS`,
  `STOS_PRIORITY_COLORS`, `colorFromString`, `tintStyles`, `STOS_PAGE_WIDTHS`, `STOS_MODAL_SHELL_STYLES(_WIDE)`,
  `STOS_TABLE_PRESET`, `STOS_TABLE_STYLE` (uses `var(--stos-*)` with light fallbacks so grids follow dark mode).
- Base typography applies only under `.stos-app`; no global element selector is emitted.

### Fonts

Latin woff2 files (from `@fontsource/*`, OFL-1.1, licenses alongside) live in `src/fonts/stoneos/` and are
copied to `dist/fonts/stoneos/`:

- UI: Inter 400/500/600, JetBrains Mono 400/500.
- Documents: Roboto, Lora, Merriweather, Source Serif 4 (400/700).

Runtime hosts load the SDK as a JS module with no stable URL for `dist/fonts`, so only Inter is inlined:
the provider injects Inter 400/500/600 `@font-face` rules (`local()` first, then a base64 woff2 `url()`),
built through the rollup `?base64` import (`theme/fontFaces.js`). JetBrains Mono and the document fonts
declare `local()` sources only; a host that serves `dist/fonts/stoneos/` can add `url()` faces for them.

## Rules

- 13px base; weights 400/500/600 only (700 does not exist).
- Type scale through Typography variants (h3 page title, h6 group header, subtitle1 row name, caption meta).
- No shadows on cards or lists; menus use `--stos-shadow-md`, modals `--stos-shadow-lg`.
- MUI Outlined icons only, at 14 / 16 / 18 / 20px. No emojis.
- Micro-interactions at 120ms; `prefers-reduced-motion` disables transitions and animations inside the kit.
- Secondary actions reveal on hover: `.stos-reveal-on-hover` inside `.stos-reveal-host`, shown on `:hover`,
  `:focus-within`, while its menu is open (`aria-expanded="true"`), and always on touch
  (`(hover: none), (pointer: coarse)`).
- Configuration modals are view-first and use `useDirtyState`; documents autosave with `SyncStatusIndicator`.
- Default view mode is `list`.

## Components

Ported (props identical to Mi Retail; Mi Retail copy replaced by props with English defaults):

| Component | Props |
|---|---|
| `PageShell` | `width` (`full`·`narrow`·`default`·`wide`), `flush`, `sx` |
| `PageHeader` | `icon`, `title`, `titleAdornment`, `count`, `description`, `breadcrumb[{label,to}]`, `actions`, `tabs` (ViewTabs props), `leading`, `sticky`, `stickyTop`, `divider`, `sx`, `children` |
| `Section` | `title`, `count`, `description`, `actions`, `variant` (`card`·`plain`), `dense`, `padding`, `maxBodyHeight`, `headerSx`, `sx` |
| `KpiTile` | `label`, `value`, `tone` (`default`·`brand`·`success`·`warning`·`danger`·`info`·`muted`), `icon`, `delta`, `onClick`, `active` |
| `FilterBar` | `chips[{id,label,icon,active,onClick,onClear,menu,node}]`, `search{value,onChange,placeholder}`, `trailing` |
| `ViewTabs` | `value`, `onChange`, `tabs[{id,label,icon,count,dividerAfter}]`, `onAdd`, `addLabel` |
| `DataTable` | Mi Retail props (`rows`, `columns`, `groupBy`, `groups`, `groupCounts`, `collapsedGroups`, `onToggleGroup`, `onAddInGroup(key, draft)`, `onEditStages`, `onRowDropInGroup(row, key)`, pagination, selection, subtasks via `parentKey`/`expandedParents`/`childrenByParent`/`onAddSubtask`) + `labels`, `footerLabels`. Rows carry `__tree` for column renderers; drag payload MIME `STOS_ROW_DRAG_MIME` or `text/plain` |
| `TableFooter` | `count`, `page`, `pageSize`, `pageSizeOptions`, `onChange`, `rowsPerPageLabel`, `displayedRowsLabel`, `pageLabels` |
| `GroupHeader` | `label`, `color`, `stage`, `count`, `pageCount`, `collapsed`, `onToggle`, `onAdd`, `menuItems`, `addLabel`, `optionsLabel`, `expandLabel`, `collapseLabel`, `pageAndTotalLabel` |
| `RowActionsMenu` | `items[{id,label,icon,onClick,danger,disabled,hidden,dividerBefore}]`, `copyActions[{id,label,onClick}]`, `label`, `size`, `className` |
| `EmptyState` | `icon`, `illustration` (`inbox`·`search`·`board`·`tree`·`folder`·`error`), `title`, `description`, `action{label,onClick,icon}`, `size`, `variant` |
| `StatusPill` | `stage`/`status`, `variant` (`tint`·`solid`), `size`, `label`, `showDot`, `compact`, `minWidth`, `interactive`, `readOnly`, `readOnlyReason`, `stages`, `canMoveTo`, `onSelect`, `labels`, `groupOrder`, `emptyLabel`, `searchPlaceholder`, `noMatchesLabel` |
| `PriorityPill` | `priority`, `size`, `showLabel`, `interactive`, `options[{name,title,color}]`, `labels`, `emptyLabel`, `onSelect`, `onClick` |
| `TypeTag` | `type` (key or `{name,title}`), `size`, `emptyLabel` |
| `AssigneeAvatars` | `people[{name,identity,avatarUrl}]`, `max`, `size`, `showName`, `interactive`, `onAdd`, `emptyLabel`, `peopleLabel(count)` |
| `ConfirmDialog` | `open`, `title`, `description`, `confirmLabel`, `cancelLabel`, `danger`, `busy`, `extraAction`, `onConfirm`, `onClose` |
| `MediaPreviewDialog` | `open`, `items` (`[{ id, name, mimeType \| mime_type, url? }]`), `index`, `onIndexChange`, `onClose`, `resolveUrl(item) → Promise<string>`, `labels` (`MEDIA_PREVIEW_LABELS`). In-app preview of images (zoom/fit), PDF, video and audio with download, close, Esc, backdrop click and previous/next; never navigates the host tab. `mediaFamily(item)` → `image \| video \| audio \| pdf \| file` |
| `EntityDetailShell` | `breadcrumbSection`, `title`, `slug`, `tags`, `copyLinkPath`, `onEdit`, `meta[{label,value,mono,render}]`, `metaColumns`, `tabs[{id,label,icon,content}]`, `topBarExtra`, `topBarLabels`, `onClose`, `renderHeader`, `headerExtra`, `footer`, `width`, `bodyHeight`, `activeTab`, `onTabChange` |
| `EntityModalTopBar` | `breadcrumbSection`, `title`, `copyLinkPath`, `onEdit`, `onClose`, `rightExtra`, `labels` |
| `KeyValueRow` | `label`, `value`, `mono` |
| `EntityManagerShell` | `entitySelected`, `onUpdatedEntity`, `setIsOpen`, `isPopupContext`, `mode`, `width`, `editLabel`, `renderPreview`, `renderEdit` |

New:

| Component | Props |
|---|---|
| `AppTopBar` | 44px. `breadcrumb[{id,label,to,onClick}]` (last = current), `onBack`, `backLabel`, `leading`, `syncIndicator`, `right`, `sticky`, `sx` |
| `ViewModeToggle` | `value`, `onChange(value)`, `options[{value,label,icon}]` (default list/grid), `label`, `sx`. 28px segmented control, arrow keys move |
| `SyncStatusIndicator` | `status` (`saved`·`saving`·`offline`·`conflict`·`error`), `labels`, `descriptions` (tooltip), `showCaption`, `onClick`, `sx` |
| `DocumentCard` | `title`, `meta`, `thumbnailUrl`, `icon`, `pinned`, `pinnedLabel`, `actions` (RowActionsMenu items, revealed on hover), `actionsLabel`, `selected`, `variant` (`row`·`tile`), `untitledLabel`, `onOpen`, `sx` |
| `NotificationCard` | `title`, `body`, `time`, `avatarUrl`, `icon`, `severity` (`info`·`success`·`warning`·`error`), `actions[{id,label}]` (max 2), `onAction(action)`, `onClick`, `onClose`, `closeLabel`, `width`, `sx` |
| `ShortcutKeys` | `combo` (`'mod+shift+k'` or array of combos), `sx`. `mod` = ⌘ on Apple platforms, Ctrl elsewhere. Helpers: `formatShortcut`, `isApplePlatform` |
| `useDirtyState(initialValues, { onSave })` | → `{ values, setField, setValues, isDirty, status, error, save, discard, reset }`; `onSave` may return the new baseline; follows new `initialValues` only while clean |

### Record patterns (promoted from Mi Retail Workspaces)

The patterns every StoneOS business app shares in a record's detail and create form (`business-core.md`
§5.4, `app-blueprint.md` §5). Copy lives in `labels` (English defaults, merged over the exported
`*_LABELS`); data arrives through injected loaders, never through a fetch inside the kit.

**Quiet fields.** `STOS_QUIET_FIELD` (`{ size: 'small', fullWidth: true, sx: STOS_QUIET_FIELD_SX }`) is spread
on every `TextField`, `Autocomplete` or picker text field of a property band: no frame or fill at rest, the
`--stos-border` frame and the paper fill on hover and focus, clear and expand affordances only while the
field is in play, quiet while disabled. `EntityDetailShell` brings a `meta[].render` cell to
`STOS_FIELD_TEXT_INSET` (6px) with `STOS_BAND_FIELD_SX` (text inputs, multiline, adorned, autocomplete and
date pickers) and gives the label and the plain `value` cells the same inset, so each value starts exactly
under its label.

| Component | Props |
|---|---|
| `EvidenceList` | `pieces[{id,label,url,note,added_by{identity,name},added_at}]`, `editable`, `actor{identity,name}`, `onAttach(piece)` (answer `false` or throw to keep the draft), `onRemove(piece, index)` (the caller confirms), `onOpenLink(url)` (default: new tab, `noopener`), `formatTimestamp`, `labels` (`EVIDENCE_LIST_LABELS`), `sx`. Only `http(s)` links get an Open button |
| `Pulse` | `loadPage({ page, pageSize })` (→ `{ items, totalPages }`, a Link Loom envelope or a list; a rejection or `success: false` is a failed load with a retry, never an empty history), `subjectKey`, `refreshKey`, `pageSize` (25), `labels` (`PULSE_LABELS`, merged one level deep: `periods`, `verbTitles`, `summaries`, `fields`), `locale`, `timeZone`, `summarize(entry)`, `glyphOf(entry)` (`pulseGlyphOf`), `renderValue({ change, side, value })`, `resolveReference(field, value)`, `resolvePerson(value)`, `hiddenFields`, `sx` |
| `OrganizationPicker` | `value`, `onChange(organization \| null)`, `searchOrganizations({ search, pageSize })`, `myOrganization`, `includeMine` (true), `label`, `placeholder`, `disabled`, `autoFocus`, `error`, `helperText`, `size`, `labels` (`ORGANIZATION_PICKER_LABELS`), `sx`. Loads on open, narrows on the server (300ms), your organization first; a failed or unauthorized directory says so and offers a retry |
| `OrganizationAvatar` | `organization{display_name,slug,logo_url}`, `size`, `sx`. Logo (falls back when it fails to load), or the initial on the muted surface |
| `OrganizationBadge` | `organization`, `size`, `variant`, `caption`, `strong`, `labels`, `sx`. Avatar + name + Veripass verified mark (`is_verified`) |
| `WorkspacePicker` | `organizationId`, `loadWorkspaces({ organizationId })`, `value` (id), `valueSnapshot`, `onChange(id, workspace)`, `disabled`, `label`, `placeholder`, `showSlug` (true), `renderIcon(icon, { color, fontSize })`, `labels` (`WORKSPACE_PICKER_LABELS`), `sx`. Listing-only workspaces (`is_listing_only`) carry a lock; the intake keeps its glyph and reads as `labels.intake` until renamed |
| `WorkspaceSquare` | `workspace{id,name,slug,kind,ui{color,icon}}`, `size`, `radius`, `renderIcon`, `sx` |

Pulse entries follow the Mi Retail activity shape: `{ id, verb, occurred_at, actor_identity,
context: { actor_display_name }, source, organization_id, payload: { changes: [{ field, kind, from, to }],
reason, target_organization, issuing_organization } }`. A verb is read by its ending
(`record_state_changed`, `record.state_changed` → `state_changed`; `PULSE_ACTIONS`); change kinds are
`PULSE_CHANGE_KINDS` (`text`, `rich_text`, `person`, `stage`, `date`, `catalog`, `reference`, `number`, `flag`,
`structured`). An app's own verbs (`record_review_cancelled`) are titled by their full name in
`labels.verbTitles`, summarized by `entry.summary` (or `summarize`) and drawn by `glyphOf`. Rows are grouped by
`PULSE_PERIODS` in the reader's time zone; Up/Down/Home/End move the selection; under 720px of container width
the detail replaces the list with a way back. Nothing in Pulse edits.
Helpers: `summarizePulseEntry(entry, labels, { locale })`, `pulseGlyphOf(entry)`, `resolveWorkspaceUi`,
`workspaceNameOf`.

### Ribbon

```jsx
<Ribbon
  tabs={[{ id, label, groups: [{ id, label, icon, items: [item] }] }]}
  contextualTabs={[{ id, label, accent, groups }]}
  fileTab={{ label, render: ({ close }) => node }}
  activeTab onTabChange collapsed onCollapsedChange compact labels
/>
```

`item`: `{ id, type: 'button'|'split'|'toggle'|'select'|'color'|'custom', size: 'large'|'small', icon, label, tooltip, shortcut, active, disabled, onClick, options, value, onChange, render, showLabel, width }`

- Tabs row: underline tabs 36px 13/500, roving tab index, Left/Right/Home/End move between tabs, double-click toggles collapse.
- Groups row 92px: large buttons (icon 20 + label 12, 2 lines), small buttons 28px (icon 16; label when no icon or `showLabel`) stacked two per column, group caption 11 tertiary, 1px separators.
- `split`: main action + menu of `options[{id,label,icon,shortcut,onClick,value}]`; picking calls `option.onClick` and `onChange(option.value ?? option.id)`.
- `toggle`: `active` → `--stos-bg-selected` + brand text, `aria-pressed`.
- `select`: 28px Select over `options[{value,label}]`, `onChange(value)`.
- `color`: swatch underline in `value`; popover palette (StoneOS neutrals + card colors, or `options`) plus a custom picker; `onChange(color)`.
- `custom`: `render({ close })`.
- Collapsed: tabs only; a tab click opens the groups row as an overlay until an action runs, click-away or Escape.
- `fileTab`: full-area backstage covering the enclosing `.stos-app`; Escape closes.
- Contextual tabs: accent top border.
- Responsive: a ResizeObserver collapses groups from the right into one dropdown button named after the group.
- `compact`: one 36px toolbar with the first tab's items.
- Every item has a tooltip with its label and `ShortcutKeys`.
- `labels`: `collapse`, `expand`, `moreOptions`, `customColor`, `toolbar`.

## Notification preferences

Same key, event, shape, defaults and `shouldToast` semantics as the Sommatic SDK hook, extended with
per-app flags:

```js
{
  paused, quiet_hours: { enabled, start, end }, min_priority, muted_types,
  apps: { [appSlug]: { enabled: true, toast: true, desktop: true } }
}
```

Exports: `NOTIFICATION_PREFS_KEY`, `NOTIFICATION_PREFS_EVENT`, `readNotificationPreferences`,
`writeNotificationPreferences`, `isQuietNow`, `useNotificationPreferences()` → `{ prefs, shouldToast, shouldNotify }`,
`shouldNotify({ appSlug, channel: 'toast'|'desktop', severity })` (pause and quiet hours apply globally,
then the app's `enabled` and channel flag; unknown apps default to enabled).

## Document editor

```jsx
<RichDocumentEditor
  value={html}
  onChange={({ html, json, text }) => {}}   // debounced 150ms
  profile="document"                        // 'notes' | 'document' | 'slide-text'
  editable placeholder autofocus className
  uploadImage={(file) => sdk.files.upload(file)}           // → { id, url, pending }
  resolveStorageUrl={(id) => sdk.files.getUrl(id, { recordId })}  // short-lived URL per render
  resolvePendingUpload={sdk.files.resolve} onUploadSynced={sdk.files.onUploadSynced}
  mergeFields={[{ name: 'client.name', label: 'Client name' }]}
  onEditorReady={(editor) => {}}            // drive it from a Ribbon with editorCommands
  pageLayout={{ size: 'A4', orientation: 'portrait', margins: { top: 25, right: 25, bottom: 25, left: 25 } }}
  labels={{ /* SLASH_COMMAND_LABELS overrides */ }}
/>
```

- No toolbar: apps compose `Ribbon` and call `editorCommands[id].run(editor, value)`; each entry also has
  `isAvailable(editor)` and, where relevant, `isActive(editor)` / `getValue(editor)`. Ids: `EDITOR_COMMAND_IDS`.
- Content CSS is scoped to `.stos-doc` and injected once (`style[data-stos-editor]`), shared with exports.
- `pageLayout` renders a gray canvas with a white sheet (size and margins in mm), dashed separators every
  page height, and page breaks that push content to the next page. Exact pagination belongs to print CSS.
- Images of storage objects persist only `<img data-storage-id="sto-…">` (never a URL or token). The image
  node view renders them with `resolveStorageUrl(id)`; legacy `src` values pointing to `/storage/file/sto-…`
  are read as storage ids. Offline uploads keep a `blob:` / `data-pending-upload` placeholder until
  `resolvePendingUpload(key) → { id }` knows the object.
- Paste and external `value` go through `sanitizeDocumentHtml(html, { profile })` (DOMPurify allowlist).
- `createEditorExtensions({ profile, placeholder, uploadImage, mergeFields, labels })`:
  - `notes`: starter kit, underline, highlight, typography, link, tasks, toggle, callout, image (+ paste/drop upload), table (not resizable), search, slash menu.
  - `document`: everything: marks, color, font family/size, alignment, line height, paragraph spacing, indent (`Mod-]`/`Mod-[`), page break (`Mod-Enter`), resizable tables, merge fields (`{{name}}` input rule), table of contents, document styles, character count.
  - `slide-text`: marks, color, font family/size, paragraph alignment, lists.
- Document styles: `editor.commands.setDocumentStyle(name, declarations)` / `setDocumentStyles(map)`;
  names `normal`, `title`, `heading1`-`heading6`, `quote`, `code`, `link`, `table` (others map to `.stos-style-{name}`);
  `editor.storage.documentStyles.getDocumentStylesCss(scope = '.stos-doc')`. Apps persist `editor.storage.documentStyles.styles`.

IO:

| Function | Result |
|---|---|
| `exportDocumentHtml({ html, title, pageLayout, documentStylesCss, extraHeadCss })` | standalone HTML string |
| `printHtmlToPdf({ html, title, pageLayout, header, footer = '{page}' })` | hidden iframe print; `{page}` / `{pages}` in `@page` margin boxes where supported |
| `exportMarkdown(html)` | Markdown (tables, task lists, toggles, `<!-- page-break -->`) |
| `importMarkdown(markdown)` | sanitized HTML |
| `exportDocx({ json, title, pageLayout, documentStylesCss, header = null, footer = '{page}', resolveStorageUrl })` | `Promise<Blob>` (.docx); storage images are resolved at export time |
| `resolveStorageImages(htmlOrJson, resolveStorageUrl)` | `Promise` of the same content with `src` resolved for `data-storage-id` images (call before `exportDocumentHtml`, `printHtmlToPdf`, `exportMarkdown`) |
| `storageIdFromUrl(url)` | storage object id of a legacy `/storage/file/sto-…` URL, or null |
| `importDocx(file, { uploadImage })` | `Promise<string>` sanitized HTML (mammoth) |
