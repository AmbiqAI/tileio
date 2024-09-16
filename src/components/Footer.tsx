import React from "react";
import { AppBar, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
          backgroundColor: (theme: Theme) => alpha(theme.palette.background.default, 0.65),
          backdropFilter: "blur(8px)",
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
