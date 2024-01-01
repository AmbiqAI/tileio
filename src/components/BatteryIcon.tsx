import BatteryUnknownIcon from "@mui/icons-material/BatteryUnknown";
import Battery20Icon from "@mui/icons-material/Battery20";
import Battery30Icon from "@mui/icons-material/Battery30";
import Battery50Icon from "@mui/icons-material/Battery50";
import Battery60Icon from "@mui/icons-material/Battery60";
import Battery80Icon from "@mui/icons-material/Battery80";
import Battery90Icon from "@mui/icons-material/Battery80";
import Battery100Icon from "@mui/icons-material/BatteryFull";
import { SvgIconProps, Tooltip } from "@mui/material";

interface Props extends SvgIconProps {
  level: number;
}

const BatteryIcon = (props: Props) => {
  const BatteryLevels = [
    Battery20Icon, // 0
    Battery20Icon, // 10
    Battery20Icon, // 20
    Battery30Icon, // 30
    Battery50Icon, // 40
    Battery50Icon, // 50
    Battery60Icon, // 60
    Battery80Icon, // 70
    Battery80Icon, // 80
    Battery90Icon, // 90
    Battery100Icon, // 100
  ];
  const { level, ...cprops } = props;
  const levelIndex = Math.min(Math.max(0, Math.ceil(level / 10)), 10);
  if (level === -1) {
    return (
      <Tooltip title="unavailable" arrow>
        <BatteryUnknownIcon {...cprops} />
      </Tooltip>
    );
  }
  const Component = BatteryLevels[levelIndex];
  return (
    <Tooltip title={level.toFixed(0)} arrow>
      <Component {...cprops} />
    </Tooltip>
  );
};

export default BatteryIcon;
