import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Divider, Stack, Switch, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { IDevice } from "../../../models/device";
import Footer from "../../../components/Footer";
import { ThemeColors } from "../../../theme/theme";
import { SignalConnectionIcon } from "../../../components/Tiles/SignalStateTile";
import { ISlot, ISlotConfig } from "../../../models/slot";
import Grid from "@mui/material/Unstable_Grid2/Grid2";


const QosBarItem = observer(({ device }: { device: IDevice }) => {

  const colors = [
    ThemeColors.colors.primaryColor,
    ThemeColors.colors.secondaryColor,
    ThemeColors.colors.tertiaryColor,
    ThemeColors.colors.quaternaryColor
  ];

  const slotStates = device.info.slots.map((slot, idx) => ({
    state: device.slots[idx].mask.qosState,
    color: colors[idx],
    name: `S${idx}`,
  }));

  return (
    <Grid container rowSpacing={0.5} columnSpacing={2} maxWidth="160px">
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
            <Typography variant="button" fontWeight={800} pr="8px">
              {state.name}
            </Typography>
          </div>
          <SignalConnectionIcon connected={device.state.connected} state={state.state} fontSize="small" />
        </Stack>
      </Grid>
      ))}
  </Grid>
  );
});

const UioBarItem = observer(({ device }: { device: IDevice }) => {
  const btnItems = [{
    name: 'B0',
    state: device.uioState.btn0
  }, {
    name: 'B1',
    state: device.uioState.btn1
  }, {
    name: 'B2',
    state: device.uioState.btn2
  }, {
    name: 'B3',
    state: device.uioState.btn3
  }];

  return (
    <Grid container rowSpacing={0.5} columnSpacing={1} maxWidth="160px">
      {btnItems.map((btn, idx) => (
        <Grid xs={6} key={`btn-${btn.name}`}>
          <Stack direction="row" alignItems="center">
            <Switch
              disabled={!device.state.connected}
              checked={btn.state}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                device.setUioButton(idx, event.target.checked);
              }}
              size="small"
            />
            <Typography variant="button" fontWeight={600} >
            {btn.name}
            </Typography>
          </Stack>
        </Grid>
      ))}
  </Grid>
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
