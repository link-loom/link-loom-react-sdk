import React, { useState } from "react";
import PropTypes from "prop-types";
import { Collapse, List, ListItemText, ListItemIcon } from "@mui/material";
import { SidebarItem, SidebarItemIcon, StyledExpandLess, StyledExpandMore } from "./Sidebar.styles";

/**
 * Recursive component to render sidebar items with support for N-level nesting.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.item - The item data node.
 * @param {string} props.item.id - Unique identifier for the item.
 * @param {string} props.item.label - Display label for the item.
 * @param {node} [props.item.icon] - Icon element to display.
 * @param {string} [props.item.className] - Custom class name.
 * @param {boolean} [props.item.disabled] - Whether the item is disabled.
 * @param {boolean} [props.item.defaultExpanded] - Whether the item is expanded by default.
 * @param {boolean} [props.item.hideExpandIcon] - Whether to hide the expand icon.
 * @param {Object} [props.item.typographyProps] - Typography props for the label.
 * @param {Function} [props.item.onClick] - Click handler for the item.
 * @param {node} [props.item.actions] - Action elements (e.g. menu).
 * @param {Array} [props.item.children] - Nested children items.
 * @param {number} [props.level=0] - Current nesting level (0-based).
 * @param {Function} [props.onItemClick] - Global click handler wrapper.
 */
const SidebarRecursiveItemComponent = ({ item, level = 0, onItemClick = null }) => {
  const [isOpen, setIsOpen] = useState(!!item.defaultExpanded);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e) => {
    // If it has children, toggle expand
    if (hasChildren) {
      setIsOpen(!isOpen);
    }

    // Call the item's own click handler if it exists
    if (item.onClick) {
      item.onClick(e);
    }

    // Call the global/parent handler if needed
    if (onItemClick) {
      onItemClick(item, e);
    }
  };

  // User request:
  // Level 1 (0): 2rem padding
  // Level 2 (1): 4rem padding
  const paddingLeft = `${2 + level * 2}rem`;

  return (
    <>
      <SidebarItem onClick={handleClick} sx={{ paddingLeft }} className={item.className} disabled={item.disabled}>
        {/* Icon: Only show for Level 0 (User's Level 1) */}
        {level === 0 && item.icon && (
          <SidebarItemIcon className="d-flex justify-content-center" sx={{ minWidth: 30 }}>
            {item.icon}
          </SidebarItemIcon>
        )}

        {/* Text */}
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: level === 0 ? "0.9rem" : "0.85rem",
            noWrap: true,
            color: "#6c757d",
            ...item.typographyProps,
          }}
          className="ms-1"
        />

        {/* Actions / Expand Icon */}
        <div className="d-flex align-items-center">
          {/* Item-specific actions (e.g. Kebab menu) - visible on hover via CSS in SidebarItem */}
          {item.actions && (
            <div className="item-actions d-flex" onClick={(e) => e.stopPropagation()}>
              {item.actions}
            </div>
          )}

          {/* Expand/Collapse Icon */}
          {hasChildren && !item.hideExpandIcon && (
            <div className="ms-1">{isOpen ? <StyledExpandLess fontSize="small" /> : <StyledExpandMore fontSize="small" />}</div>
          )}
        </div>
      </SidebarItem>

      {/* Recursive Children */}
      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <SidebarRecursiveItemComponent key={child.id} item={child} level={level + 1} onItemClick={onItemClick} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

SidebarRecursiveItemComponent.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    defaultExpanded: PropTypes.bool,
    hideExpandIcon: PropTypes.bool,
    typographyProps: PropTypes.object,
    onClick: PropTypes.func,
    actions: PropTypes.node,
    children: PropTypes.array,
  }).isRequired,
  level: PropTypes.number,
  onItemClick: PropTypes.func,
};

export default SidebarRecursiveItemComponent;
