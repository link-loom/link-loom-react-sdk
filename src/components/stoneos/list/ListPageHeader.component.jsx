import React from 'react';
import PageHeader from '../page-header/PageHeader.component.jsx';

// The kit's page header with the title and the actions in one row. On a narrow screen the actions go to
// their own line and the title wraps, instead of the title being cut to make room for the buttons.
const RESPONSIVE_HEADER_SX = {
  '& > div:first-of-type': { flexWrap: 'wrap', rowGap: 1 },
  '& h1': { whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip' },
};

function ListPageHeader({ sx, ...props }) {
  return <PageHeader {...props} sx={{ ...RESPONSIVE_HEADER_SX, ...sx }} />;
}

export default ListPageHeader;
