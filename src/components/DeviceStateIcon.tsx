import BluetoothOnIcon from "@mui/icons-material/BluetoothOutlined";
import BluetoothConnectedIcon from "@mui/icons-material/BluetoothConnectedRounded";
import BluetoothOffIcon from "@mui/icons-material/BluetoothDisabledRounded";
import UsbOnIcon from "@mui/icons-material/UsbOutlined";
import UsbConnectedIcon from "@mui/icons-material/UsbRounded"
import UsbOffIcon from "@mui/icons-material/UsbOffRounded";

import { SvgIconProps, Tooltip } from "@mui/material";
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
          <UsbConnectedIcon {...cprops} />
      );
    } else if (online) {
      return (
          <UsbOnIcon {...cprops} />
      );
    }
    return (
        <UsbOffIcon {...cprops} />
    )
  }
};

export default DeviceStateIcon;
