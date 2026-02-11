import React, { useState } from "react";
import { List, Collapse, Tooltip, ListItemText, Menu, MenuItem, ListItemIcon } from "@mui/material";
import {
  SidebarSectionHeader,
  SidebarHeaderIcon,
  SidebarHeaderText,
  StyledExpandLess,
  StyledExpandMore,
  SidebarActionFooter,
  SidebarItemIcon,
} from "./Sidebar.styles";
import SidebarRecursiveItemComponent from "./SidebarRecursiveItem.component";

/**
 * Component to render a sidebar group with a header and recursive items.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.title - The title of the section.
 * @param {node} props.icon - The icon for the section header.
 * @param {boolean} props.isCondensed - Whether the sidebar is in condensed mode.
 * @param {Array<import('./types').SidebarItemNode>} props.items - The tree of items to render.
 * @param {boolean} [props.defaultExpanded=true] - Whether the section is expanded by default.
 * @param {boolean} [props.collapsible=true] - Whether the section can be collapsed. If false, acts as a direct link.
 * @param {Function} [props.onHeaderClick] - Override the default header toggle behavior.
 * @param {Object} [props.footer] - Optional footer configuration { label, onClick, icon }.
 * @param {Function} [props.onItemClick] - Optional callback when any item is clicked.
 */
const SidebarGroupComponent = ({
  title,
  icon,
  isCondensed,
  items = [],
  defaultExpanded = true,
  collapsible = true,
  onHeaderClick,
  footer,
  onItemClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [headerAnchorEl, setHeaderAnchorEl] = useState(null);

  const handleHeaderClick = (e) => {
    if (isCondensed) {
      // In condensed mode, non-collapsible items might still need a tooltip or just navigation.
      // If items exist, show menu. If not (direct link), do nothing here (parent handles nav via onHeaderClick).
      if (items.length > 0) {
        setHeaderAnchorEl(e.currentTarget);
      } else if (onHeaderClick) {
        onHeaderClick(e);
      }
    } else {
      if (onHeaderClick) {
        onHeaderClick(e);
      }
      if (collapsible) {
        setIsExpanded((prev) => !prev);
      }
    }
  };

  const handleHeaderClose = () => {
    setHeaderAnchorEl(null);
  };

  return (
    <List component="nav" className="w-100 p-0">
      {/* Header */}
      <Tooltip title={isCondensed ? title : ""} placement="right">
        <SidebarSectionHeader onClick={handleHeaderClick}>
          <SidebarHeaderIcon className="d-flex justify-content-center">{icon}</SidebarHeaderIcon>
          {!isCondensed && (
            <>
              <SidebarHeaderText primary={title} />
              {collapsible && (isExpanded ? <StyledExpandLess fontSize="small" /> : <StyledExpandMore fontSize="small" />)}
            </>
          )}
        </SidebarSectionHeader>
      </Tooltip>

      {/* Content */}
      {!isCondensed ? (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {items.map((item) => (
              <SidebarRecursiveItemComponent
                key={item.id}
                item={item}
                level={0} // Start at level 0 relative to this section
                onItemClick={onItemClick}
              />
            ))}

            {/* Footer Action (e.g. "See more projects") */}
            {footer && (
              <SidebarActionFooter onClick={footer.onClick} className="ms-1 border-bottom">
                {footer.icon && <SidebarItemIcon className="d-flex justify-content-center">{footer.icon}</SidebarItemIcon>}
                <ListItemText
                  primary={footer.label}
                  primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
                  className="ms-1"
                />
              </SidebarActionFooter>
            )}
          </List>
        </Collapse>
      ) : (
        /* Condensed Mode Menu */
        <Menu
          anchorEl={headerAnchorEl}
          open={Boolean(headerAnchorEl)}
          onClose={handleHeaderClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{ ml: 1 }}
        >
          <MenuItem disabled sx={{ fontWeight: 600, fontSize: "0.8rem", opacity: "1 !important" }}>
            {title.toUpperCase()}
          </MenuItem>
          {items.map((item) => (
            <MenuItem
              key={item.id}
              onClick={(e) => {
                if (item.onClick) item.onClick(e);
                handleHeaderClose();
              }}
              sx={{ fontSize: "0.9rem", color: "#6c757d" }}
            >
              <ListItemIcon sx={{ minWidth: "30px !important" }}>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
          {footer && (
            <MenuItem
              onClick={() => {
                if (footer.onClick) footer.onClick();
                handleHeaderClose();
              }}
              sx={{ borderTop: "1px solid rgba(0,0,0,0.05)", mt: 1, fontSize: "0.9rem", fontWeight: 500 }}
            >
              {footer.label}
            </MenuItem>
          )}
        </Menu>
      )}
    </List>
  );
};

export default SidebarGroupComponent;
