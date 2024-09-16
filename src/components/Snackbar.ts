import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Theme } from "@mui/material";
import { SnackbarProvider } from 'notistack';

const Snackbar = styled(SnackbarProvider)(({ theme }: {theme: Theme}) => ({

  '&.notistack-MuiContent-info': {
    backgroundColor: theme.palette.info.main,
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: theme.palette.error.main,
  },
  '&.notistack-MuiContent-success': {
    backgroundColor: theme.palette.success.main,
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: theme.palette.warning.main,
  }
}));

Snackbar.defaultProps = {
};

Snackbar.displayName = 'SnackbarProvider';

export default withTheme(Snackbar);
