import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../models/device";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import NavButton from "../NavButton";
import UioDialog from "./UioDialog";
import { useState } from "react";

const UioBarItem = observer(({ device }: { device: IDevice }) => {

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

  const [isDialogOpen, showDialog] = useState(false);

  return (
    <>
    <NavButton
      onClick={() => { showDialog(true); }}
    >
        <Grid container alignItems="center" rowSpacing={0.5} columnSpacing={1} minWidth="80px" maxWidth="180px">
          {btnItems.filter(btn => btn.info.enabled).map((btn, idx) => (
            <Grid xs={6} key={`btn-${btn.info.name}-${idx}`} >
              <Box alignItems="center">
                <Typography variant="subtitle2" fontWeight={600} >
                  {btn.state ? btn.info.on : btn.info.off}
                </Typography>
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
