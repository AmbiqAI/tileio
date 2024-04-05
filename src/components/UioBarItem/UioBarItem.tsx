import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import NavButton from "../NavButton";
import UioDialog from "./UioDialog";
import { useState } from "react";

const UioBarItem = observer(({ device }: { device: IDevice }) => {

  const ioItems = [{
    info: device.info.uio.io0,
    state: device.uioState.io0,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // device.setIoState(0, event.target.checked ? 1 : 0);
    }
  }, {
    info: device.info.uio.io1,
    state: device.uioState.io1,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // device.setIoState(1, event.target.checked ? 1 : 0);
    }
  }, {
    info: device.info.uio.io2,
    state: device.uioState.io2,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // device.setIoState(2, event.target.checked ? 1 : 0);
    }
  }, {
    info: device.info.uio.io3,
    state: device.uioState.io3,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // device.setIoState(3, event.target.checked ? 1 : 0);
    }
  }];

  const [isDialogOpen, showDialog] = useState(false);

  return (
    <>
    <NavButton
      onClick={() => { showDialog(true); }}
    >
        <Grid container alignItems="center" rowSpacing={0.5} columnSpacing={1} minWidth="80px" maxWidth="180px">
          {ioItems.filter(btn => btn.info.enabled).map((io, idx) => (
            <Grid xs={6} key={`btn-${io.info.name}-${idx}`} >
              <Box alignItems="center">
                {(io.info.ioType === "Toggle") && (
                  <Typography variant="subtitle2" fontWeight={600} >
                  {io.state ? io.info.on : io.info.off}
                  </Typography>
                )}
                {(io.info.ioType === "Slider") && (
                  <Typography variant="subtitle2" fontWeight={600} >
                  {io.state}
                  </Typography>
                )}
                {(io.info.ioType === "Select") && (

                  <Typography variant="subtitle2" fontWeight={600} >
                  {io.info.selectInputs[io.state] || io.state}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
    </NavButton>
    <UioDialog
      open={isDialogOpen}
      onClose={() => { showDialog(false); }}
      device={device}
    />
    </>
  );
});
export default UioBarItem;
