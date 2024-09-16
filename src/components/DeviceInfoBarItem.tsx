import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { Divider, Stack } from '@mui/material';
import { observer } from 'mobx-react';
import DeviceStateIcon from './DeviceStateIcon';
import NavButton from './NavButton';
import { IDashboard } from '../models/dashboard';
import { useStore } from '../models/store';
import DeviceDialog from './DeviceDialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DeviceChips from './DeviceChips';
import { ScanIcon } from '../assets/icons';
// import DeviceDetailMenu from './DeviceDetailMenu';

interface Props {
  dashboard: IDashboard;
}

const DeviceInfoBarItem = ({ dashboard }: Props) => {
  const { root: { device } } = useStore();
  const [isDeviceDialogOpen, showDeviceDialog] = useState(false);

  return (
    <>
      <Stack
        spacing={0}
        py={0.0}
        direction="row"
        alignItems="stretch"
      >
        {!device && (
          <>
          <Divider orientation="vertical" flexItem />
          <NavButton
            onClick={() => { showDeviceDialog(true); }}
            sx={{px: 1}}
          >
            <Stack direction="column" justifyContent="end">
              <Stack direction="row" justifyContent="start" alignItems="center">
                <ScanIcon />
                <Typography variant="h6" ml={1}>Select Device</Typography>
              </Stack>
            </Stack>
          </NavButton>
          <Divider orientation="vertical" flexItem />
          </>
        )}
        {!!device && (
          <Stack direction="row" justifyContent="end">
            <Divider orientation="vertical" flexItem />
            <NavButton
              sx={{ minWidth: 100, justifyContent: "end" }}
              onClick={() => { showDeviceDialog(true); }}
            >
              <Stack direction="column" justifyContent="end" alignSelf="end">
                <Stack direction="row" justifyContent="start" alignItems="center">
                  {/* <DeviceIcon /> */}
                  <Typography variant="h6" fontWeight={700} ml={1}>{device.name}</Typography>
                </Stack>
                <DeviceChips device={device} size="small" color="secondary" />
              </Stack>
            </NavButton>
            <Divider orientation="vertical" flexItem />
            <LoadingButton
              disabled={device.state.connecting || device.state.disconnecting}
              loading={device.state.connecting || device.state.disconnecting}
              loadingPosition="center"
              // variant="outlined"
              onClick={() => {
                if (!device) {
                  return;
                }
                if (device.state.connected) {
                  device.disconnect();
                } else {
                  device.connect(dashboard);
                }
              }}
            >
              <DeviceStateIcon
                type={device.type}
                online={device.state.online}
                connected={device.state.connected}
                sx={{ opacity: device.state.connecting || device.state.disconnecting ? 0 : 1 }}
              />
            </LoadingButton>
            {/* <Divider orientation="vertical" flexItem />
            <DeviceDetailMenu dashboard={dashboard} device={device} /> */}
          </Stack>
        )}


      </Stack>
      <DeviceDialog
        dashboard={dashboard}
        open={isDeviceDialogOpen}
        close={() => { showDeviceDialog(false); }}
      />

    </>
  );

};

export default observer(DeviceInfoBarItem);
