import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { observer } from 'mobx-react';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnectedRounded';
import BluetoothOffIcon from '@mui/icons-material/BluetoothDisabledRounded';
import BatteryIcon from '../../../components/BatteryIcon';
import SignalIcon from '../../../components/SignalIcon';
import { IDevice } from '../../../models/device';
import DeviceInfoDialog from '../../../components/DeviceInfoDialog';
import { IDeviceInfo } from '../../../models/deviceInfo';
import NavButton from '../../../components/NavButton';

interface Props {
  device: IDevice;
  small: boolean;
}

const DeviceInfoBarItem = ({ device, small }: Props) => {

  const [isDeviceInfoDialogOpen, showDeviceInfoDialog] = useState(false);
  const deviceState = device.state;
  const deviceInfo = device.info;

  return (
    <>
      <NavButton
        onClick={() => { showDeviceInfoDialog(true); }}
      >
        <Stack spacing={-0.5} sx={{ flexGrow: 1 }} alignItems="flex-start">
          <Typography variant={small ? "subtitle1" : "h6"} fontWeight={700}>{deviceInfo.name}</Typography>
          {!deviceState.online ? (
            <Stack spacing={-0.1} flexDirection="row" alignItems="center">
              <BluetoothOffIcon fontSize="small" color="error" sx={{ fontSize: 16 }} />
              <Typography variant="overline" color="error" sx={{ lineHeight: 'normal' }}> Offline </Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.2} flexDirection="row" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {deviceInfo.location || deviceInfo.shortId}
              </Typography>
              <BatteryIcon level={deviceState.batteryLevel} color={deviceState.connected ? "inherit" : "disabled"} sx={{ fontSize: 16 }} />
              <SignalIcon level={deviceState.signalStrength} color={deviceState.connected ? "inherit" : "disabled"} sx={{ fontSize: 16 }} />
              {deviceState.connected && (<BluetoothConnectedIcon sx={{ fontSize: 16 }} />)}
            </Stack>
          )}
        </Stack>
      </NavButton>
      <DeviceInfoDialog
        open={isDeviceInfoDialogOpen}
        info={deviceInfo}
        batteryLevel={deviceState.batteryLevel}
        signalStrength={deviceState.signalStrength}
        lastSeenDate={deviceInfo.lastSeenDate}
        onSubmit={async (info: IDeviceInfo) => {
          deviceInfo.copyFrom(info);
          // device.setInfo(info)
        }}
        onClose={() => { showDeviceInfoDialog(false); }}
        disabled={false}
      />
    </>
  )
};

export default observer(DeviceInfoBarItem);
