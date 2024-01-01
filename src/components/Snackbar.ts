import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Theme } from "@mui/material";
import { SnackbarProvider } from 'notistack';

const Snackbar = styled(SnackbarProvider)(({ theme }: {theme: Theme}) => ({
  '&.info': {
    background: theme.palette.info.main,
  },
  '&.error': {
    background: theme.palette.error.main,
  },
  '&.success': {
    background: theme.palette.success.main,
  },
  '&.warning': {
    background: theme.palette.warning.main,
  }
}));

Snackbar.defaultProps = {
  classes: {
    variantSuccess: 'success',
    variantError: 'error',
    variantWarning: 'warning',
    variantInfo: 'info',
  },
};

Snackbar.displayName = 'SnackbarProvider';

export default withTheme(Snackbar);
