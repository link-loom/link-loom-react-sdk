import React from "react";
import { styled } from "@mui/material/styles";

const StyledFooter = styled("footer")({
  backgroundColor: "var(--ct-bg-leftbar)",
  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.03)",
  zIndex: 1,
  borderTopColor: "rgba(0, 0, 0, 0.05)",
});

const SidebarFooterComponent = ({ condensed, children }) => {
  return (
    <StyledFooter className={`d-flex ${condensed ? "justify-content-center" : "justify-content-start"} border-top`}>
      {children}
    </StyledFooter>
  );
};

export default SidebarFooterComponent;
