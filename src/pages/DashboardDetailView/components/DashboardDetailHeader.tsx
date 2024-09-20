import { useHistory } from 'react-router-dom';
import { IconButton, Toolbar, useMediaQuery } from '@mui/material';
import Header from '../../../components/Header';
import { observer } from 'mobx-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';

import { IDevice } from '../../../models/device';
import { Stack, useTheme } from '@mui/system';
import { IDashboard } from '../../../models/dashboard';
import DashboardInfoBarItem from './DashboardInfoBarItem';
import DeviceInfoBarItem from '../../../components/DeviceInfoBarItem';

interface Props {
  dashboard: IDashboard;
  device: IDevice;
}

const DasboardDetailHeader = ({ dashboard, device }: Props) => {
  const theme = useTheme();
  const size = useMediaQuery(theme.breakpoints.down('sm')) ? "small" : "medium"
  const history = useHistory();
  return (
    <Header>
      <Toolbar disableGutters sx={{alignItems: "stretch"}}>
        <IconButton
          size={size} edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mx: 0.5, my: "auto" }}
          onClick={() => history.push('/dashboards')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          width="100%"
          >
          <DashboardInfoBarItem dashboard={dashboard} size={size} />
          <DeviceInfoBarItem dashboard={dashboard} size={size} />
        </Stack>
      </Toolbar>

    </Header>
  )
};

export default observer(DasboardDetailHeader);
