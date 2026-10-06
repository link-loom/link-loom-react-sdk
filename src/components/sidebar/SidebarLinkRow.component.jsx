import React from 'react';
import { styled } from '@mui/material/styles';
import SidebarGroup from './group/SidebarGroup.component.jsx';
import SidebarCollapseToggle from './SidebarCollapseToggle.component.jsx';
import useSidebarCondensed from './useSidebarCondensed.hook.js';

const LinkRow = styled('div')({
  '&.ll-sidebar-link--with-toggle': { position: 'relative' },
  '&.ll-sidebar-link--with-toggle > nav > .MuiListItemButton-root': { paddingRight: 40 },
});

/**
 * A sidebar row that is a link, not a section (Overview, Dashboard): the header navigates and never
 * toggles. With `withCollapseToggle` the row also carries the control that condenses and expands the
 * whole sidebar: at its right when expanded, above its icon when condensed.
 */
function SidebarLinkRow({ title, icon, active = false, onClick, withCollapseToggle = false, collapseLabel, expandLabel }) {
  const isCondensed = useSidebarCondensed();
  const toggle = withCollapseToggle ? (
    <SidebarCollapseToggle collapseLabel={collapseLabel} expandLabel={expandLabel} />
  ) : null;
  const className = [
    'px-0',
    'll-sidebar-link',
    withCollapseToggle && !isCondensed ? 'll-sidebar-link--with-toggle' : '',
    active ? 'is-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LinkRow className={className}>
      {isCondensed && toggle}
      <SidebarGroup
        title={title}
        icon={icon}
        isCondensed={isCondensed}
        collapsible={false}
        defaultExpanded={false}
        items={[]}
        onHeaderClick={onClick}
      />
      {!isCondensed && toggle}
    </LinkRow>
  );
}

export default SidebarLinkRow;
