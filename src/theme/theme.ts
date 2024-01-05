import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import type {} from '@mui/lab/themeAugmentation';

export const lightTheme = createTheme({
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 620,
      md: 900,
      lg: 1200,
      xl: 1536
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#9737FD',
      light: '#ce6cff',
      dark: '#6926b1'
    },
    secondary: {
      main: '#20bff6',
      light: '#64deff',
      dark: '#007da4'
    },
    success: {
      main: '#2fdf75',
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: '#0000000',
      secondary: '#0000000',
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            "-webkit-box-shadow": "0 0 0 100px var(--primary-weak) inset",
            "-webkit-text-fill-color": "var(--text-primary)",
          },
        },
      },
    }
  }
});

export const darkTheme = createTheme({
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 620,
      md: 900,
      lg: 1200,
      xl: 1536
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ce6cff',
    },
    secondary: {
      main: '#20BFF6',
    },
    success: {
      main: '#2fdf75',
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: '#FFF',
      secondary: '#FFF',
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            "-webkit-box-shadow": "0 0 0 100px var(--primary-weak) inset",
            "-webkit-text-fill-color": "var(--text-primary)",
          },
        },
      },
    },
  }
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
    quaternaryColor: '#220f58', // Navy
    slots: ['#11acd5', '#ce6cff', '#ea3424', '#220f58']
  }
}
