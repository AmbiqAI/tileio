import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Fade, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { observer } from 'mobx-react';
import Device, { IDevice } from '../../models/device';
import { useStore } from '../../models/store';
import DashboardDetailHeader from './components/DashboardDetailHeader';
import DashboardDetailFooter from './components/DashboardDetailFooter';
import TileCard from './components/TileCard';
import Dashboard, { IDashboard } from '../../models/dashboard';


type DeviceParams = {
  id: string;
}


const EmpyTileView = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{ height: "100%", pt: 4 }}
    >
      <Typography variant="h6"> No Tiles Added </Typography>
      <br />
      <Typography variant="button">
        Go to settings to add tiles
      </Typography>
    </Stack>
  );
};

const NoDashboardView = ({ id }: { id: string }) => {
  const dashboard = Dashboard.create({ id: id, name: "Unknown" });
  const device = Device.create({ id: "0", name: "Unknown" });
  return (
    <Box
      sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))", width: "100%" }}
    >
      <DashboardDetailHeader dashboard={dashboard} device={device}/>
      <Stack
        direction="column"
        alignItems="center"
        sx={{ height: "100%", pt: 4 }}
      >
        <Fade in>
          <div> Dashboard not found or no longer available. </div>
        </Fade>
      </Stack>
    </Box>
  );
}


const DashboardDetailGrid = observer(({ dashboard, device }: { dashboard: IDashboard, device: IDevice }) => {
  return (
    // <Fade in>
      <Grid
        container
        px={1}
        rowSpacing={1.0} columnSpacing={1.0}
        justifyContent="flex-start"
        alignContent="flex-start"
        alignItems="flex-start"
        width="100%"
        margin="auto"
      >
        {dashboard.tiles.map((item, idx) => {
          return (
            <TileCard key={`${item.name}-${idx}`}
              name={item.name}
              size={item.size}
              type={item.type}
              dashboard={dashboard}
              slots={device.slots}
              pause={!device.state.connected}
              uioState={device.uioState}
              // device={device}
              config={item.config}
            />
          )
        })}
      </Grid>
    // </Fade>
  )
});


const DashboardDetailView = () => {
  const { id } = useParams<DeviceParams>();
  const { root: { dashboardById, device, clearActiveDevice } } = useStore();
  const dashboard = dashboardById(decodeURIComponent(id));
  let dDevice = device;
  // if (!!dDevice && dDevice.dashboard && dDevice.dashboard?.id !== id) {
  //   clearActiveDevice();
  //   dDevice = null;
  // }
  if (dDevice == null) {
    dDevice = Device.create({ id: "0", name: "Unknown" });
  }
  if (dashboard === undefined) {
    return (
      <NoDashboardView id={id} />
    );
  }

  return (
    <Box
      sx={{
        pb: 8,
        pt: 'calc(1.5em + env(safe-area-inset-top))',
        height: "100%",
        width: "100%",
        maxWidth: "1600px",
        margin: "auto",
      }}
    >
      <DashboardDetailHeader dashboard={dashboard} device={dDevice} />
      {dashboard.tiles.length === 0 && <EmpyTileView />}
      <DashboardDetailGrid dashboard={dashboard} device={dDevice}/>
      <DashboardDetailFooter dashboard={dashboard} device={dDevice} />
    </Box>
  );
}

export default observer(DashboardDetailView);
