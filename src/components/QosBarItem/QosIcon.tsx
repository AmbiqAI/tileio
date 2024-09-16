import DisconnectedIcon from '@mui/icons-material/SensorsOffRounded';
import ConnectIcon from '@mui/icons-material/SensorsRounded';
import { getQoSColor, ISlot } from "../../models/slot";


interface Props {
  connected: boolean;
  state: number;
  fontSize: "small" | "inherit" | "medium" | "large";
};

const QosIcon = ({ connected, state, fontSize }: Props) => {
  let color = getQoSColor(connected, state);
  let SignalIcon = connected || state ? ConnectIcon : DisconnectedIcon;
  return <SignalIcon fontSize={fontSize} htmlColor={color} />;
};

export default QosIcon;
