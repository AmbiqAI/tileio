import React from "react";
import { AppBar, styled, Theme, useScrollTrigger } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box } from "@mui/system";

function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 30,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 2,
    sx: {
      transition: "background-color 0.5s",
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.background.default, trigger ? 0.4 : 0.75),
      backdropFilter: trigger ? "blur(8px)" : "blur(0px)",
      position: "fixed",
      pt: `env(safe-area-inset-top)`,
      top: 0,
      bottom: "auto",
      left: 0,
      right: 0,
    },
  });
}

interface Props {
  children?: React.ReactNode;
}

function Header({ children }: Props) {
  return (
      <ElevationScroll>
        <AppBar
          position="fixed"
          color="inherit"
          sx={{
            position: "fixed",
            pt: 1,
            top: 0,
            bottom: "auto",
            left: 0,
            right: 0,
          }}
        >
          {children}
        </AppBar>
      </ElevationScroll>
  );
}

export const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const HeaderOffset = () => {
  return (
    <div>
    <Offset />
    <div
      style={{
        height: "calc(env(safe-area-inset-top, 1em))",
        width: "100%",
      }}
    >
    </div>
    </div>
  );
}

export default Header;
