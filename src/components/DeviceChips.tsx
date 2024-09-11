import { observer } from "mobx-react";
import { Chip, Stack } from "@mui/material";

import { IDevice } from "../models/device";
import DeviceStateIcon from "./DeviceStateIcon";
import { DeviceInterfaceType } from "../models/types";
import BatteryIcon from "./BatteryIcon";
import SignalIcon from "./SignalIcon";

interface Props {
  device: IDevice;
  size?: "small" | "medium";
  color?: "default" | "primary" | "secondary";
}

const DeviceChips = ({ device, size, color  }: Props) => {
  return (
    <Stack spacing={1} direction="row" justifyContent="start">
    {!device.state.connected && (
      <Chip
        icon={<DeviceStateIcon type={device.type} online={device.state.online} connected={device.state.connected}/>}
        size="small"
        variant="outlined"
        color={device.state.disconnected ? "error" : color}
        label={device.state.connectionState}
      />
    )}
    {(device.type === DeviceInterfaceType.ble) && device.state.connected && (
      <Chip
        icon={<BatteryIcon level={device.state.batteryLevel} color={device.state.connected ? "inherit" : "disabled"}/>}
        size={size}
        variant="outlined"
        color={color}
        label={`${device.state.batteryLevel}%`}
      />
    )}
    {(device.type === DeviceInterfaceType.ble && device.state.connected) && (
      <Chip
        icon={<SignalIcon level={device.state.signalStrength} color={device.state.connected ? "inherit" : "disabled"}/>}
        size={size}
        variant="outlined"
        color={color}
        label={`${device.state.signalStrength} dBm`}
      />
    )}
  </Stack>
  )
};

DeviceChips.defaultProps = {
  size: "medium",
  color: "secondary",
};

export default observer(DeviceChips);
