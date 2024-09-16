import BluetoothOnIcon from "@mui/icons-material/BluetoothOutlined";
import BluetoothConnectedIcon from "@mui/icons-material/BluetoothConnectedRounded";
import BluetoothOffIcon from "@mui/icons-material/BluetoothDisabledRounded";
import UsbAvailableIcon from '@mui/icons-material/CableRounded';
import UsbOnIcon from "@mui/icons-material/UsbOutlined";
import UsbOffIcon from "@mui/icons-material/UsbOffRounded";

import { SvgIconProps } from "@mui/material";
import { DeviceInterfaceType } from "../models/types";

interface Props extends SvgIconProps {
  type: DeviceInterfaceType;
  connected: boolean;
  online: boolean;
}

const DeviceStateIcon = (props: Props) => {

  const { type, connected, online, ...cprops } = props;

  if (type === DeviceInterfaceType.ble) {
    if (connected) {
      return (
          <BluetoothConnectedIcon {...cprops} />
      );
    } else if (online) {
      return (
          <BluetoothOnIcon {...cprops} />
      );
    }
    return (
        <BluetoothOffIcon {...cprops} />
    )
  } else {
    if (connected) {
      return (
          <UsbOnIcon {...cprops} />
      );
    } else if (online) {
      return (
          <UsbAvailableIcon {...cprops} />
      );
    }
    return (
        <UsbOffIcon />
    )
  }
};

export default DeviceStateIcon;
