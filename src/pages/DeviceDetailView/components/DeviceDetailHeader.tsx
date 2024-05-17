import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import { IconButton, Stack, Toolbar, useMediaQuery } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Header from '../../../components/Header';
import { observer } from 'mobx-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';

import DeviceStateIcon from '../../../components/DeviceStateIcon';
import { IDevice } from '../../../models/device';
import { useTheme } from '@mui/system';
import RecordBarItem from '../../../components/RecordBarItem';
import DeviceInfoBarItem from './DeviceInfoBarItem';
import DeviceDetailMenu from '../../../components/DeviceDetailMenu';


const DeviceDetailHeader = ({ device }: { device: IDevice }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down(500));
  const history = useHistory();
  const deviceState = device.state;
  const deviceInfo = device.info;
  const handleConnectClick = async () => {
    if (deviceState.connected) { await device.disconnect(); }
    else { await device.connect(); }
  };
  return (
    <Header>
      <Toolbar>

        <IconButton
          size="large" edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 0.5 }}
          onClick={() => history.push('/devices')}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <DeviceInfoBarItem device={device} small={isSmall} />
        </Box>

        <Stack flexDirection="row" justifyContent="center">

          <RecordBarItem device={device} />

          {!isSmall && (<LoadingButton
            sx={{ ml: 0.5 }}
            disabled={deviceState.connecting || deviceState.disconnecting || !deviceState.online}
            loading={deviceState.connecting || deviceState.disconnecting}
            loadingPosition="center"
            variant="outlined"
            onClick={handleConnectClick}
          >
            <DeviceStateIcon
              type={deviceInfo.type}
              online={deviceState.online}
              connected={deviceState.connected}
              sx={{ opacity: deviceState.connecting || deviceState.disconnecting ? 0 : 1 }}
            />
          </LoadingButton>
          )}

          <DeviceDetailMenu device={device} />

        </Stack>
      </Toolbar>

    </Header>
  )
};

export default observer(DeviceDetailHeader);
