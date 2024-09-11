import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import NavButton from "../NavButton";
import UioDialog from "./UioDialog";
import { useState } from "react";
import { UIOType } from "../../models/uioState";
import { IDashboard } from "../../models/dashboard";

interface Props {
  device: IDevice;
  dashboard: IDashboard;
}

const UioBarItem = observer(({ device, dashboard }: Props) => {

  const ioItems = [{
    info: dashboard.device.uio.io0,
    state: device.uioState.io0,
  }, {
    info: dashboard.device.uio.io1,
    state: device.uioState.io1,
  }, {
    info: dashboard.device.uio.io2,
    state: device.uioState.io2,
  }, {
    info: dashboard.device.uio.io3,
    state: device.uioState.io3,
  }, {
    info: dashboard.device.uio.io4,
    state: device.uioState.io4,
  }, {
    info: dashboard.device.uio.io5,
    state: device.uioState.io5,
  }, {
    info: dashboard.device.uio.io6,
    state: device.uioState.io6,
  }, {
    info: dashboard.device.uio.io7,
    state: device.uioState.io7,
  }];

  const numEnabled = ioItems.filter(btn => btn.info.enabled).length;

  const itemSize = numEnabled > 4 ? 3 : 6;

  const [isDialogOpen, showDialog] = useState(false);

  return (
    <>
    <NavButton onClick={() => { showDialog(true); }} >
        <Grid container alignItems="center" rowSpacing={0.5} columnSpacing={1} minWidth="120px" maxWidth="200px">
          {ioItems.filter(btn => btn.info.enabled).map((io, idx) => (
            <Grid xs={itemSize} key={`btn-${io.info.name}-${idx}`} minWidth="40px">
              <Box alignItems="center">
              {(io.info.ioType === UIOType.Momentary) && (
                  <Typography width="100%" noWrap variant="subtitle2" fontWeight={500} >
                  {io.state ? io.info.on : io.info.off}
                  </Typography>
                )}
                {(io.info.ioType === UIOType.Toggle) && (
                  <Typography width="100%" noWrap variant="subtitle2" fontWeight={500} >
                  {io.state ? io.info.on : io.info.off}
                  </Typography>
                )}
                {(io.info.ioType === UIOType.Slider) && (
                  <Typography width="100%" noWrap variant="subtitle2" fontWeight={500} >
                  {io.state}
                  </Typography>
                )}
                {(io.info.ioType === UIOType.Select) && (
                  <Typography width="100%" noWrap variant="subtitle2" fontWeight={500} >
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
      dashboard={dashboard}
    />
    </>
  );
});
export default UioBarItem;
