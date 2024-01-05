import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Fade, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { observer } from 'mobx-react-lite';
import { NotFoundDevice } from '../../models/device';
import { useStore } from '../../models/store';
import DeviceDetailHeader from './components/DeviceDetailHeader';
import DeviceDetailFooter from './components/DeviceDetailFooter';
import TileCard from './components/TileCard';

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
        Go to device settings to add tiles
      </Typography>
    </Stack>
  );
};

const NoDeviceView = ({id }: {id: string}) => {
  const d = NotFoundDevice(id);
  return (
    <Box
      sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))", width: "100%" }}
    >
      <DeviceDetailHeader device={d} />
      <Stack
        direction="column"
        alignItems="center"
        sx={{ height: "100%", pt: 4 }}
      >
        <Fade in>
          <div> Device not found or no longer available. Please rescan for available devices. </div>
        </Fade>
      </Stack>
    </Box>
  );
}

const DeviceDetailView = () => {
  const { id } = useParams<DeviceParams>();
  const { root: { deviceById } } = useStore();
  const device = deviceById(decodeURIComponent(id));

  if (device === undefined) {
    return (
    <NoDeviceView id={id} />
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
      <DeviceDetailHeader device={device} />
      {device.settings.tiles.length === 0 && <EmpyTileView />}
      <Fade in>
        <Grid
          container
          px={1}
          spacing={1.5}
          justifyContent="flex-start"
          alignContent="flex-start"
          alignItems="flex-start"
          width="100%"
          margin="auto"
        >
          {device.settings.tiles.map((item, idx) => {
            return (
              <TileCard key={`${item.name}-${idx}`}
                name={item.name}
                size={item.size}
                type={item.type}
                device={device}
                config={item.config}
              />
            )
          })}
        </Grid>
      </Fade>
      <DeviceDetailFooter device={device} />
    </Box>
  );
}

export default observer(DeviceDetailView);
