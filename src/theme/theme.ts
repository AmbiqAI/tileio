// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { createTheme, ThemeOptions } from '@mui/material/styles';

const typography: ThemeOptions['typography'] = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h6: { fontWeight: 500 },
  button: { textTransform: 'none', fontWeight: 500 },
};

const components: ThemeOptions['components'] = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 12,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }),
    },
  },
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  MuiButton: { defaultProps: { disableElevation: true } },
  MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
  MuiTooltip: { defaultProps: { arrow: true } },
};

export const lightTheme = createTheme({
  typography,
  components,
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 960,
      lg: 1200,
      xl: 1520
    },
  },
  palette: {
    mode: 'light',
    background: { default: '#f3f5f7', paper: '#ffffff' },
    divider: 'rgba(15, 23, 42, 0.12)',
    primary: {
      main: '#7945bd',
      light: '#ce6cff',
      dark: '#6926b1'
    },
    secondary: {
      main: '#007f9e',
      light: '#64deff',
      dark: '#007da4'
    },
    success: {
      main: '#2fdf75',
    },
    error: {
      main: "#ff1744",
    },
    text: {
      primary: '#20252d',
      secondary: '#596579',
    }
  },
});

export const darkTheme = createTheme({
  typography,
  components,
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 960,
      lg: 1200,
      xl: 1520
    },
  },
  palette: {
    mode: 'dark',
    background: { default: '#101318', paper: '#181d24' },
    divider: 'rgba(148, 163, 184, 0.16)',
    primary: {
      main: '#bd6bf0',
    },
    secondary: {
      main: '#20BFF6',
    },
    success: {
      main: '#2fdf75',
    },
    error: {
      main: "#ff1744",
    },
    text: {
      primary: '#f1f4f8',
      secondary: '#a3afbf',
    }
  },
});


export const ThemeColors = {
  colors: {
    purple: '#9737FD',
    green: '#20BFF6',
    grey: '#7F7F7F',
    greyAlpha: '#7F7F7F',
    primaryColor: '#11acd5', // Blue
    secondaryColor: '#ce6cff', // Purple
    tertiaryColor: '#ea3424', // Red
    quaternaryColor: '#38FF60', // Green
    slots: ['#11acd5', '#ce6cff', '#ea3424', '#38FF60']
  }
}
