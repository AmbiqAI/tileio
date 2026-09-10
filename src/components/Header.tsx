// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from "react";
import { AppBar, styled, Theme, useScrollTrigger } from "@mui/material";
import { alpha } from "@mui/material/styles";

function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 30,
  });

  return React.cloneElement(children, {
    elevation: 0,
    sx: {
      transition: "background-color 150ms ease",
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.background.default, trigger ? 0.98 : 0.96),
      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      position: "fixed",
      pt: `env(safe-area-inset-top)`,
      top: 0,
      bottom: "auto",
      left: 0,
      right: 0,
      borderBottomStyle: 'solid',
      borderBottomWidth: '1px',
      borderBottomColor: 'divider',
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
          color="transparent"
          elevation={0}
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
