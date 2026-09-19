// src/index.js
export { default as Alert } from './components/alert/Alert.jsx';
export { default as CodeEditor } from './components/code-editor/CodeEditor.jsx';
export { default as DataGrid } from './components/datagrid/DataGrid.jsx';
export { DATAGRID_PRESETS, resolvePreset } from './components/datagrid/presets.js';
export { getDataGridLocale } from './components/datagrid/locales.js';
export { default as DocumentViewer } from './components/document-viewer/DocumentViewer.jsx';
export { default as OffCanvas } from './components/offcanvas/OffCanvas.jsx';
export { default as Placeholder } from './components/placeholder/Placeholder.jsx';
export { default as PopUp } from './components/popup/PopUp.jsx';
export { default as SearchableSelect } from './components/searchable-select/SearchableSelect.jsx';
export { default as Spinner } from './components/spinner/Spinner.jsx';
export { default as TagInputField } from './components/tags/tag-input-field/TagInputField.jsx';
export { default as TextEditor } from './components/text-editor/TextEditor.jsx';
export { default as Uploader } from './components/uploader/Uploader.jsx';
export { Snackbar as Snackbar, openSnackbar } from './components/snackbar/Snackbar.jsx';
export { Toast, openToast } from './components/toast/Toast.jsx';
export { default as OnPageLoaded } from './components/on-page-loaded/OnPageLoaded.jsx';
export { default as PhoneCountrySelector } from './components/phone-country-selector/PhoneCountrySelector.jsx';
export { default as FileViewer } from './components/file-viewer/FileViewer.jsx';
export { default as StatusChip } from './components/status/status-chip/StatusChip.jsx';
export { default as StatusSelector } from './components/status/status-selector/StatusSelector.jsx';
export { default as RetryMessage } from './components/retry-message/RetryMessage.jsx';
export { default as SnapData } from './components/snap-data/SnapData.jsx';
export { default as NationalIdentificationSelector } from './components/national-identification-selector/NationalIdentificationSelector.jsx';
export { default as CountrySelector } from './components/country-selector/CountrySelector.jsx';
export { default as Container } from './components/container/Container.jsx';
export { default as AsyncAutocomplete } from './components/async-autocomplete/AsyncAutocomplete.jsx';
export { default as QuickLinkCard } from './components/quick-link-card/QuickLinkCard.component.jsx';
export { default as VirtualList } from './components/virtual-list/VirtualList.jsx';
export { default as RecentActivityList } from './components/RecentActivityList/RecentActivityList.jsx';
export { default as ImageCardSelect } from './components/image-card-select/ImageCardSelect.jsx';
export { default as MultiSelectChips } from './components/multi-select-chips/MultiSelectChips.jsx';

export { default as useDebounce } from './hooks/useDebounce.js';
export { default as useNavigate } from './hooks/useNavigate.js';
export { default as RecentActivityService } from './services/recent-activity.service.js';
export { default as Breadcrumb } from './components/Breadcrumb/Breadcrumb.jsx';

export { default as OmniSearch } from './components/omni-search/OmniSearch.component.jsx';
export { default as OmniSearchTrigger } from './components/omni-search/OmniSearchTrigger.component.jsx';
export {
  useOmniSearchRegistry,
  OmniSearchRegistryProvider,
} from './components/omni-search/contexts/OmniSearchRegistryContext.jsx';
export { useOmniSearchRegisterCommand } from './components/omni-search/hooks/useOmniSearchRegisterCommand.js';
export { useGlobalShortcuts } from './components/omni-search/hooks/useGlobalShortcuts.js';

import './styles/_variables.scss';
import './styles/_keyframe-animations.scss';

export { serializeToMarkdown } from './lib/markdown-serializer.js';

// Sidebar Components
export { default as SidebarGroup } from './components/sidebar/group/SidebarGroup.component.jsx';
export { default as SidebarFooter } from './components/sidebar/footer/SidebarFooter.component.jsx';
export { default as SidebarRecursiveItem } from './components/sidebar/group/SidebarRecursiveItem.component.jsx';
export * from './components/sidebar/group/Sidebar.styles.jsx';

// StoneOS UI kit
export { default as StoneOSThemeProvider } from './components/stoneos/theme/StoneOSThemeProvider.component.jsx';
export { default as createStoneOSTheme } from './components/stoneos/theme/createStoneOSTheme.js';
export {
  STOS_COLORS,
  STOS_DARK_COLORS,
  STOS_CARD_COLORS,
  STOS_STATE_COLORS,
  STOS_PRIORITY_COLORS,
  STOS_PAGE_WIDTHS,
  STOS_MODAL_SHELL_STYLES,
  STOS_MODAL_SHELL_STYLES_WIDE,
  STOS_TABLE_PRESET,
  STOS_TABLE_STYLE,
  colorFromString,
  tintStyles,
} from './components/stoneos/theme/stoneos.constants.js';
export {
  STOS_STATE_LABELS,
  STOS_PRIORITY_LABELS,
  STOS_STATE_GROUP_ORDER,
} from './components/stoneos/theme/presentation.js';
export { default as PageShell } from './components/stoneos/page-shell/PageShell.component.jsx';
export { default as PageHeader } from './components/stoneos/page-header/PageHeader.component.jsx';
export { default as Section } from './components/stoneos/section/Section.component.jsx';
export { default as AppTopBar } from './components/stoneos/app-top-bar/AppTopBar.component.jsx';
export { default as KpiTile } from './components/stoneos/kpi-tile/KpiTile.component.jsx';
export { default as FilterBar } from './components/stoneos/filter-bar/FilterBar.component.jsx';
export { default as ViewTabs } from './components/stoneos/view-tabs/ViewTabs.component.jsx';
export { default as ViewModeToggle } from './components/stoneos/view-mode-toggle/ViewModeToggle.component.jsx';
export {
  default as DataTable,
  STOS_ROW_DRAG_MIME,
} from './components/stoneos/data-table/DataTable.component.jsx';
export { default as TableFooter } from './components/stoneos/data-table/TableFooter.component.jsx';
export { default as GroupHeader } from './components/stoneos/group-header/GroupHeader.component.jsx';
export { default as RowActionsMenu } from './components/stoneos/row-actions-menu/RowActionsMenu.component.jsx';
export { default as EmptyState } from './components/stoneos/empty-state/EmptyState.component.jsx';
export { default as StatusPill } from './components/stoneos/status-pill/StatusPill.component.jsx';
export { default as PriorityPill } from './components/stoneos/priority-pill/PriorityPill.component.jsx';
export { default as TypeTag } from './components/stoneos/type-tag/TypeTag.component.jsx';
export { default as AssigneeAvatars } from './components/stoneos/assignee-avatars/AssigneeAvatars.component.jsx';
export {
  default as PeoplePicker,
  PEOPLE_PICKER_LABELS,
  peopleOptionKey,
} from './components/stoneos/people-picker/PeoplePicker.component.jsx';
export { default as DocumentCard } from './components/stoneos/document-card/DocumentCard.component.jsx';
export { default as SyncStatusIndicator } from './components/stoneos/sync-status-indicator/SyncStatusIndicator.component.jsx';
export {
  default as ShortcutKeys,
  formatShortcut,
  isApplePlatform,
} from './components/stoneos/shortcut-keys/ShortcutKeys.component.jsx';
export { default as ConfirmDialog } from './components/stoneos/confirm-dialog/ConfirmDialog.component.jsx';
export {
  default as MediaPreviewDialog,
  MEDIA_PREVIEW_LABELS,
  mediaFamily,
} from './components/stoneos/media-preview-dialog/MediaPreviewDialog.component.jsx';
export { default as EntityDetailShell } from './components/stoneos/entity-detail-shell/EntityDetailShell.component.jsx';
export { default as EntityModalTopBar } from './components/stoneos/entity-detail-shell/EntityModalTopBar.component.jsx';
export { default as KeyValueRow } from './components/stoneos/entity-detail-shell/KeyValueRow.component.jsx';
export { default as EntityManagerShell } from './components/stoneos/entity-manager-shell/EntityManagerShell.component.jsx';
export { default as NotificationCard } from './components/stoneos/notification-card/NotificationCard.component.jsx';
export { default as useDirtyState } from './components/stoneos/hooks/useDirtyState.hook.js';
export { default as Ribbon } from './components/stoneos/ribbon/Ribbon.component.jsx';
export {
  NOTIFICATION_PREFS_KEY,
  NOTIFICATION_PREFS_EVENT,
  readNotificationPreferences,
  writeNotificationPreferences,
  isQuietNow,
  shouldNotify,
  useNotificationPreferences,
} from './components/stoneos/notification-preferences/notificationPreferences.js';

// StoneOS document editor
export { default as RichDocumentEditor } from './components/stoneos/editor/RichDocumentEditor.component.jsx';
export { createEditorExtensions, EDITOR_PROFILES } from './components/stoneos/editor/createEditorExtensions.js';
export { editorCommands, EDITOR_COMMAND_IDS } from './components/stoneos/editor/editorCommands.js';
export { sanitizeDocumentHtml } from './components/stoneos/editor/sanitizeDocumentHtml.js';
export { SLASH_COMMAND_LABELS } from './components/stoneos/editor/extensions/slash-command/slashItems.js';
export { EDITOR_LABELS, EDITOR_UI_LABELS } from './components/stoneos/editor/editorLabels.js';
export { BLOCK_TYPES } from './components/stoneos/editor/extensions/block-actions.js';
export { CALLOUT_VARIANTS } from './components/stoneos/editor/extensions/callout.extension.js';
export { PAGE_SIZES_MM } from './components/stoneos/editor/pageLayout.js';
export { exportDocumentHtml } from './components/stoneos/editor/io/exportDocumentHtml.js';
export { printHtmlToPdf } from './components/stoneos/editor/io/printHtmlToPdf.js';
export { exportMarkdown } from './components/stoneos/editor/io/exportMarkdown.js';
export { importMarkdown } from './components/stoneos/editor/io/importMarkdown.js';
export { looksLikeMarkdown } from './components/stoneos/editor/extensions/markdown-paste.extension.js';
export { exportDocx } from './components/stoneos/editor/io/exportDocx.js';
export { resolveStorageImages, storageIdFromUrl } from './components/stoneos/editor/io/resolveStorageImages.js';
export { importDocx } from './components/stoneos/editor/io/importDocx.js';
