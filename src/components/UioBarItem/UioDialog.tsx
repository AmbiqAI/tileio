import React from "react";
import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Typography,
  Divider,
  Stack,
  FormGroup,
  Switch,
} from "@mui/material";
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

interface Props {
  open: boolean;
  onClose: () => void;
  device: IDevice;
}

const UioDialog =  ({ open, onClose, device }: Props) => {

  const btnItems = [{
    info: device.info.uio.btn0,
    state: device.uioState.btn0,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      device.setUioButton(0, event.target.checked);
    }
  }, {
    info: device.info.uio.btn1,
    state: device.uioState.btn1,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      device.setUioButton(1, event.target.checked);
    }
  }, {
    info: device.info.uio.btn2,
    state: device.uioState.btn2,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      device.setUioButton(2, event.target.checked);
    }
  }, {
    info: device.info.uio.btn3,
    state: device.uioState.btn3,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      device.setUioButton(3, event.target.checked);
    }
  }];

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        UIO State
      </DialogTitle>
      <Divider />
      <DialogContent>

      <FormGroup>
          <Grid container spacing={1} width="100%" height="100%" pb={4}>
            {btnItems.map((btn, idx) => (
              <Grid xs={6} key={`btn-${btn.info.name}-${idx}`}>
                <Stack direction="column" alignItems="center">
                <Stack direction="row" alignItems="center">
                  <Typography variant="button" fontWeight={800} >
                    {btn.info.off}
                  </Typography>
                  <Switch
                    checked={btn.state}
                    onChange={btn.onChange}
                    disabled={!btn.info.enabled || !device.state.connected}
                    size="medium"
                  />
                  <Typography variant="button" fontWeight={800} >
                    {btn.info.on}
                  </Typography>
                </Stack>
                <Typography variant="h6">
                  {btn.info.name}
                </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
          </FormGroup>

      </DialogContent>
    </Dialog>
  );
};


export default observer(UioDialog);
