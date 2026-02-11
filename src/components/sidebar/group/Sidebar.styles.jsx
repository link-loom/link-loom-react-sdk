import React from "react";
import { styled, ListItemButton, ListItemText, ListItemIcon } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

// --- List Items ---

export const SidebarSectionHeader = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: "0.7rem",
  minHeight: 48,
}));

export const SidebarItem = styled(ListItemButton)(({ theme }) => ({
  padding: "0.1rem 0 0.1rem 2.2rem",
  "& .item-actions": {
    opacity: 0,
    transition: "opacity 0.2s",
  },
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    "& .item-actions": {
      opacity: 1,
    },
  },
}));

export const SidebarSubItem = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: "3.5rem",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const SidebarActionFooter = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: "2rem",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

// --- Texts ---

export const SidebarHeaderText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "15px",
    color: "#6c757d", // Bootstrap text-secondary
    fontWeight: 400,
  },
}));

export const SidebarItemText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "0.9rem",
    color: "#6c757d", // Bootstrap text-secondary
  },
}));

export const SidebarSubItemText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "0.85rem",
    color: "#6c757d", // Bootstrap text-secondary
  },
}));

// --- Icons ---

export const SidebarHeaderIcon = styled(({ className, ...props }) => <ListItemIcon {...props} className={className} />)(
  ({ theme }) => ({
    minWidth: 30,
  })
);

export const SidebarItemIcon = styled(({ className, ...props }) => <ListItemIcon {...props} className={className} />)(
  ({ theme }) => ({
    minWidth: 16,
  })
);

export const SidebarSubItemIcon = styled(({ className, ...props }) => <ListItemIcon {...props} className={className} />)(
  ({ theme }) => ({
    minWidth: 30,
  })
);

export const StyledExpandLess = styled(ExpandLess)(({ theme }) => ({
  color: "#6c757d", // Bootstrap text-secondary
}));

export const StyledExpandMore = styled(ExpandMore)(({ theme }) => ({
  color: "#6c757d", // Bootstrap text-secondary
}));
