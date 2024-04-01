import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../models/device";
import { ThemeColors } from "../../theme/theme";
import DisconnectedIcon from '@mui/icons-material/SensorsOffRounded';
import ConnectIcon from '@mui/icons-material/SensorsRounded';
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import NavButton from "../NavButton";
import QosDialog from "./QosDialog";
import { useState } from "react";
import { getQoSColor } from "../../models/slot";


export type QosIconProps = {
  connected: boolean,
  state: number,
  fontSize: "small" | "inherit" | "medium" | "large"
};
export const QosIcon = ({ connected, state, fontSize }: QosIconProps) => {
  let color = getQoSColor(connected, state);
  let SignalIcon = connected || state ? ConnectIcon : DisconnectedIcon;
  return <SignalIcon fontSize={fontSize} htmlColor={color} />;
};

const QosBarItem = ({ device }: { device: IDevice }) => {

  const [isDialogOpen, showDialog] = useState(false);

  const colors = ThemeColors.colors.slots;

  const slotStates = device.info.slots.map((slot, idx) => ({
    enabled: device.state.connected && idx < device.slots.length,
    state: idx < device.slots.length ? device.slots[idx].mask.qosState : 0,
    color: colors[idx % colors.length],
    name: slot.name.substring(0, 3)
  }));

  return (
    <>
    <NavButton
      onClick={() => { showDialog(true); }}
    >
      <Grid alignItems="center" container rowSpacing={0.5} columnSpacing={2} maxWidth="180px" height="100%">
        {slotStates.map((state, idx) => (
          <Grid xs={6} key={`state-${idx}`}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={0}
            >
              <div
                style={{
                  borderLeftStyle: "solid",
                  borderLeftWidth: "4px",
                  borderLeftColor: state.color,
                  paddingLeft: "8px",
                }}
              >
                <Typography variant="button" fontWeight={700} pr="8px">
                  {state.name}
                </Typography>
              </div>
              <QosIcon connected={state.enabled} state={state.state} fontSize="small" />
            </Stack>
          </Grid>
        ))}
      </Grid>
    </NavButton>
    <QosDialog
      open={isDialogOpen}
      onClose={() => { showDialog(false); }}
      device={device}
    />
    </>

  );
};

export default observer(QosBarItem);
