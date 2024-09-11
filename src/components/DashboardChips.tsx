import { observer } from "mobx-react";
import { IDashboard } from "../models/dashboard";
import { Chip, Stack } from "@mui/material";

import TileIcon from '@mui/icons-material/DashboardRounded';
import SlotsIcon from '@mui/icons-material/SchemaRounded';
import UioIcon from '@mui/icons-material/TuneRounded';
import TimeIcon from '@mui/icons-material/TimelapseRounded';

interface Props {
  dashboard: IDashboard;
  size?: "small" | "medium";
  color?: "default" | "primary" | "secondary";
}

const DashboardChips = ({ dashboard, size, color  }: Props) => {
  return (
    <Stack spacing={1} direction="row" justifyContent="start">
      <Chip
      size={size}
      icon={<TileIcon />}
      label={dashboard.tiles.length}
      variant="outlined"
      color={color}
    />
    <Chip
      size={size}
      icon={<SlotsIcon />}
      label={dashboard.numActiveSlots}
      variant="outlined"
      color={color}
    />
    <Chip
      size={size}
      icon={<UioIcon />}
      label={dashboard.numActiveUio}
      variant="outlined"
      color={color}
    />
    <Chip
      size={size}
      icon={<TimeIcon />}
      label={dashboard.duration}
      variant="outlined"
      color={color}
    />
  </Stack>
  )
};

DashboardChips.defaultProps = {
  size: "medium",
  color: "secondary",
};

export default observer(DashboardChips);
