import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Divider,
  Stack,
  FormGroup,
  CardHeader,
  CardActions,
  IconButton,
  Avatar,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import UioIcon from '@mui/icons-material/SettingsInputSvideoRounded';
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import IoControl from "../IoControl";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  device: IDevice;
}

const UioDialog = ({ open, onClose, device }: Props) => {

  const ioItems = [{
    info: device.info.uio.io0,
    state: device.uioState.io0,
  }, {
    info: device.info.uio.io1,
    state: device.uioState.io1,
  }, {
    info: device.info.uio.io2,
    state: device.uioState.io2,
  }, {
    info: device.info.uio.io3,
    state: device.uioState.io3,
  }, {
    info: device.info.uio.io4,
    state: device.uioState.io4,
  }, {
    info: device.info.uio.io5,
    state: device.uioState.io5,
  }, {
    info: device.info.uio.io6,
    state: device.uioState.io6,
  }, {
    info: device.info.uio.io7,
    state: device.uioState.io7,
  }];

  const [isSubmitting, setSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      onClose={onClose}
    >
      <DialogTitle sx={{ p: 0 }}>
      <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="device"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <UioIcon color="action" fontSize="large"/>
            </Avatar>
          }
          action={
            <CardActions>
              <IconButton
                aria-label="edit"
                size="small"
                disabled={isSubmitting || !device.state.connected}
                onClick={async () => {
                  setSubmitting(true);
                  await device.uioState.fetchState();
                  setSubmitting(false);
                }}

              >
                <RefreshIcon fontSize="large" />
              </IconButton>
            </CardActions>
          }
          title="User I/O"

        />
      </DialogTitle>
      <Divider />
      <DialogContent>
        <FormGroup>
          <Grid container spacing={3} width="100%" height="100%" minWidth="480px" pb={4} flexGrow={1}>
            {ioItems.map((io, idx) => (
              io.info.enabled && (
                <>
                <Grid xs={6} sm={4} lg={3} key={`io-${io.info.name}-${idx}`} flexGrow={1}>
                  <Stack direction="column" alignItems="center" width="100%" flexGrow={1}>
                    <IoControl
                      io={idx}
                      info={io.info}
                      state={io.state}
                      onChange={async (state: number) => {
                        await device.uioState.updateIoState(idx, state);
                      }}
                      disabled={!device.state.connected} />
                  </Stack>
                </Grid>
                <Divider />
                </>
              )
            ))}
          </Grid>
        </FormGroup>

      </DialogContent>
    </Dialog>
  );
};


export default observer(UioDialog);
