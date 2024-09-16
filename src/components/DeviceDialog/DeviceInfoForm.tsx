import { observer } from "mobx-react";
import {
  Typography,
  Divider,
  Box,
  Stack,
  useTheme,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/DeleteRounded';

import { useStore } from "../../models/store";
import DeviceStateIcon from "../DeviceStateIcon";
import { IDevice } from "../../models/device";
import LoadingButton from "@mui/lab/LoadingButton";
import { IDashboard } from "../../models/dashboard";
import StartRecordIcon from '@mui/icons-material/FiberManualRecordRounded';
import StopRecordIcon from '@mui/icons-material/StopCircleRounded';

interface Props {
  device: IDevice
  dashboard: IDashboard;
}

const DeviceInfoForm = ({ device, dashboard }: Props) => {
  const theme = useTheme();
  const { root: { clearActiveDevice } } = useStore();
  return (
    <Box m={1} px={1}>
      <Stack direction="column" justifyContent="space-between">
        <Stack direction="column" justifyContent="start">
          <Typography variant="subtitle1">
            <span style={{ color: theme.palette.primary.main }}> Name: &nbsp;</span> {device.name}
          </Typography>

          <Typography variant="subtitle1">
            <span style={{ color: theme.palette.primary.main }}> ID: &nbsp;</span> {device.shortId}
          </Typography>

          <Typography variant="subtitle1">
            <span style={{ color: theme.palette.primary.main }}> Type: &nbsp;</span> {device.type}
          </Typography>

          <Typography variant="subtitle1">
            <span style={{ color: theme.palette.primary.main }}> Status: &nbsp;</span> {device.state.connectStateName}
          </Typography>


          <Divider sx={{ py: 1 }} />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="end" mt={2}>
          <LoadingButton
            disabled={device.state.connecting || device.state.disconnecting}
            // loading={device.state.connecting || device.state.disconnecting}
            loadingPosition="start"
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
            onClick={async () => {
              await clearActiveDevice();
            }}
          >
            Forget Device
          </LoadingButton>

          {/* <LoadingButton
            disabled={!device.state.connected}
            // loading={device.state.connecting || device.state.disconnecting}
            loadingPosition="start"
            startIcon={device.recording ? <StopRecordIcon /> : <StartRecordIcon />}
            variant="outlined"
            color="error"
            onClick={async () => {
              if (device.recording) {
                await device.stopRecording();
              } else {
                await device.startRecording();
              }
            }}
          >
          </LoadingButton> */}

          <LoadingButton
            disabled={device.state.connecting || device.state.disconnecting}
            loading={device.state.connecting || device.state.disconnecting}
            loadingPosition="start"
            startIcon={
              <DeviceStateIcon
                type={device.type}
                online={device.state.online}
                connected={device.state.connected}
                sx={{ opacity: device.state.connecting || device.state.disconnecting ? 0 : 1 }}
              />
            }
            variant="outlined"
            onClick={() => {
              if (!device) {
                return;
              }
              if (device.state.connected) {
                device.disconnect();
              } else {
                device.connect(dashboard);
              }
            }}
          >
            {(device.state.connecting || device.state.disconnecting) ? device.state.connectStateName
              : device.state.connected ? "Disconnect" : "Connect"
            }
          </LoadingButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default observer(DeviceInfoForm);
