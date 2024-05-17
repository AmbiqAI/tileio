import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Typography,
  Divider,
  Stack,
  FormGroup,
} from "@mui/material";
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { ThemeColors } from "../../theme/theme";
import { getQoSName } from "../../models/slot";
import { QosIcon } from "./QosBarItem";

interface Props {
  open: boolean;
  onClose: () => void;
  device: IDevice;
}

const QosDialog =  ({ open, onClose, device }: Props) => {

  const colors = ThemeColors.colors.slots;

  const slotStates = device.info.slots.map((slot, idx) => ({
    enabled: device.state.connected && idx < device.slots.length,
    state: idx < device.slots.length ? device.slots[idx].mask.qosState : 0,
    color: colors[idx % colors.length],
    name: slot.name.substring(0, 12)
  }));


  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle>
        QoS State
      </DialogTitle>
      <Divider />
      <DialogContent>

      <FormGroup>
        <Grid alignItems="center" container spacing={4}  height="100%">
          {slotStates.map((state, idx) => (
            <Grid xs={6} key={`state-${idx}`}>
              <Stack
                direction="row"
                justifyContent="space-evenly"
                alignItems="center"
                spacing={1}
              >
                <div
                  style={{
                    borderLeftStyle: "solid",
                    borderLeftWidth: "4px",
                    borderLeftColor: state.color,
                    paddingLeft: "8px",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} pr="8px">
                    {state.name}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" fontWeight={800} pr="8px">
                    {getQoSName(state.enabled, state.state)}
                  </Typography>
                  <QosIcon connected={state.enabled} state={state.state} fontSize="medium" />
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>

      </FormGroup>

      </DialogContent>
    </Dialog>
  );
};


export default observer(QosDialog);
