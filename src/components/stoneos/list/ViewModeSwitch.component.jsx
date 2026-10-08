import React from 'react';
import {
  AccountTreeOutlined as TreeIcon,
  ViewListOutlined as ListIcon,
  GridViewOutlined as GridIcon,
} from '@mui/icons-material';
import ViewModeToggle from '../view-mode-toggle/ViewModeToggle.component.jsx';
import { VIEW_MODES, resolveListLabels } from './listSurface.labels.js';
import { viewModeOptions } from './viewMode.helpers.js';

const MODE_ICONS = { list: <ListIcon />, grid: <GridIcon />, tree: <TreeIcon /> };

// The toggle between the ways a list can be shown: list and grid, or list and tree.
function ViewModeSwitch({ value, onChange, modes = VIEW_MODES, labels, locale = 'en' }) {
  const text = resolveListLabels(labels, locale);

  return (
    <ViewModeToggle
      value={value}
      onChange={onChange}
      label={text.viewMode}
      options={viewModeOptions(modes, text).map((option) => ({ ...option, icon: MODE_ICONS[option.value] }))}
    />
  );
}

export default ViewModeSwitch;
