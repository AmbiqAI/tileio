import BluetoothOnIcon from "@mui/icons-material/BluetoothOutlined";
import BluetoothConnectedIcon from "@mui/icons-material/BluetoothConnectedRounded";
import BluetoothOffIcon from "@mui/icons-material/BluetoothDisabledRounded";
import UsbOnIcon from "@mui/icons-material/UsbOutlined";
import UsbConnectedIcon from "@mui/icons-material/UsbRounded"
import UsbOffIcon from "@mui/icons-material/UsbOffRounded";

import { SvgIconProps, Tooltip } from "@mui/material";

interface Props extends SvgIconProps {
  type: string;
  connected: boolean;
  online: boolean;
}

const DeviceStateIcon = (props: Props) => {

  const { type, connected, online, ...cprops } = props;

  if (type === "ble") {
    if (connected) {
      return (
        <Tooltip title="Connected" arrow>
          <BluetoothConnectedIcon {...cprops} />
        </Tooltip>
      );
    } else if (online) {
      return (
        <Tooltip title="Available" arrow>
          <BluetoothOnIcon {...cprops} />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Unavailable" arrow>
        <BluetoothOffIcon {...cprops} />
      </Tooltip>
    )
  } else {
    if (connected) {
      return (
        <Tooltip title="Connected" arrow>
          <UsbConnectedIcon {...cprops} />
        </Tooltip>
      );
    } else if (online) {
      return (
        <Tooltip title="Available" arrow>
          <UsbOnIcon {...cprops} />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Unavailable" arrow>
        <UsbOffIcon {...cprops} />
      </Tooltip>
    )
  }
};

export default DeviceStateIcon;
