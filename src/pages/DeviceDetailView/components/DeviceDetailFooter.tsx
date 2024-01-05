import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Divider, FormGroup, Stack, Switch, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { IDevice } from "../../../models/device";
import Footer from "../../../components/Footer";
import { ThemeColors } from "../../../theme/theme";
import { SignalConnectionIcon } from "../../../components/Tiles/SignalStateTile";
import Grid from "@mui/material/Unstable_Grid2/Grid2";


const QosBarItem = observer(({ device }: { device: IDevice }) => {

  const colors = ThemeColors.colors.slots;

  const slotStates = device.info.slots.map((slot, idx) => ({
    enabled: device.state.connected && idx < device.slots.length,
    state: idx < device.slots.length ? device.slots[idx].mask.qosState : 0,
    color: colors[idx%colors.length],
    name: slot.name.substring(0, 3)
  }));

  return (
    <Grid container rowSpacing={1} columnSpacing={2} maxWidth="180px">
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
          <SignalConnectionIcon connected={state.enabled} state={state.state} fontSize="small" />
        </Stack>
      </Grid>
      ))}
  </Grid>
  );
});

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


  return (
    <FormGroup>
      <Grid container rowSpacing={1} columnSpacing={0} maxWidth="180px">
        {btnItems.filter(btn => btn.info.enabled).map((btn, idx) => (
          <Grid xs={6} key={`btn-${btn.info.name}-${idx}`}>
            <Stack direction="row" alignItems="center">
              <Switch
                disabled={!device.state.connected || !btn.info.enabled}
                checked={btn.state}
                onChange={btn.onChange}
                // size="small"
              />
            <Typography variant="button" fontWeight={600} >
            {btn.state ? btn.info.on: btn.info.off}
            </Typography>
            </Stack>
            </Grid>
        ))}
    </Grid>
  </FormGroup>
  );
});



const DeviceDetailFooter = ({ device }: { device: IDevice }) => {
  return (
    <>
      <Footer>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack spacing={1} py={0} direction="row" alignItems="center">

            <QosBarItem device={device} />

            <Divider orientation="vertical" flexItem />

            <UioBarItem device={device} />

            <Divider orientation="vertical" flexItem />

            </Stack>
          </Box>
        </Toolbar>
      </Footer>
    </>
  );
};

export default observer(DeviceDetailFooter);
