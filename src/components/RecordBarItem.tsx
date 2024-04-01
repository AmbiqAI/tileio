import Typography from "@mui/material/Typography";
import { Button, Stack } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../models/device";
import StartRecordIcon from '@mui/icons-material/FiberManualRecordRounded';
import StopRecordIcon from '@mui/icons-material/StopCircleRounded';

const RecordBarItem = ({ device }: { device: IDevice }) => {
  const deviceState = device.state;

  return (
    <Button
      sx={{ p: 1 }}
      variant="outlined"
      color={device.recording ? "error" : "primary"} aria-label="Record"
      disabled={!deviceState.connected}
      onClick={async () => {
        if (device.recording) {
          await device.stopRecording();
        } else {
          await device.startRecording();
        }
      }}
    >
      <Stack direction="row">
        {device.recording ? <StopRecordIcon /> : <StartRecordIcon />}
        {device.recording && (
          <Typography sx={{ ml: 0.2 }} variant="button">
            {device.recordDurationStr}
          </Typography>
        )}
      </Stack>
    </Button>
  );
};
export default observer(RecordBarItem);
