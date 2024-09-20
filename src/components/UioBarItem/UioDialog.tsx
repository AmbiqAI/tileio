import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Divider,
  Stack,
  CardHeader,
  CardActions,
  IconButton,
  Avatar,
  Box,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import UioIcon from '@mui/icons-material/TuneRounded';
import CloseIcon from '@mui/icons-material/Close';
import { IDevice } from "../../models/device";
import { useState } from "react";
import { IDashboard } from "../../models/dashboard";
import IoCard from "./IoCard";


interface Props {
  open: boolean;
  onClose: () => void;
  dashboard: IDashboard;
  device: IDevice;
}

const UioDialog = ({ open, onClose, dashboard, device }: Props) => {

  const ioItems = [{
    config: dashboard.device.uio.io0,
    state: device.uioState.io0,
  }, {
    config: dashboard.device.uio.io1,
    state: device.uioState.io1,
  }, {
    config: dashboard.device.uio.io2,
    state: device.uioState.io2,
  }, {
    config: dashboard.device.uio.io3,
    state: device.uioState.io3,
  }, {
    config: dashboard.device.uio.io4,
    state: device.uioState.io4,
  }, {
    config: dashboard.device.uio.io5,
    state: device.uioState.io5,
  }, {
    config: dashboard.device.uio.io6,
    state: device.uioState.io6,
  }, {
    config: dashboard.device.uio.io7,
    state: device.uioState.io7,
  }];

  const [isSubmitting, setSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
    >
      <DialogTitle sx={{ p: 0 }}>
        <CardHeader
          title="User I/O"
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="device"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <UioIcon color="action" fontSize="large" />
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
              <IconButton
                aria-label="close"
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            </CardActions>
          }
        />
      </DialogTitle>
      <Divider />
      <DialogContent style={{padding: 0}}>

        <Stack spacing={1} direction="row" justifyContent="center" height="100%" width="100%">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              flexWrap: "wrap",
            }}
          >

            {ioItems.map((io, idx) => (
              io.config.enabled && (
                <Box key={`io-${idx}`} sx={{ margin: 1 }}>
                  <IoCard
                    index={idx}
                    config={io.config}
                    io={io.state}
                    disabled={!device.state.connected}
                    onChange={async (state: number) => {
                      await device.uioState.updateIoState(idx, state);
                    }}
                  />
                </Box>
              )))}
          </Box>
        </Stack>

      </DialogContent>
    </Dialog>
  );
};


export default observer(UioDialog);
