import React from "react";
import { AppBar } from "@mui/material";
import { Box } from "@mui/system";

interface Props {
  children?: React.ReactNode;
}

function Footer({ children }: Props) {
  return (
    <Box sx={{ flexGrow: 1, mt: 5 }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          position: "fixed",
          pb: `env(safe-area-inset-bottom)`,
          top: "auto",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {children}
      </AppBar>
    </Box>
  );
}

export default Footer;
