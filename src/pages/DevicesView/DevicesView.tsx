import { observer } from "mobx-react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";
import { useStore } from "../../models/store";
import DeviceCard from "../../components/DeviceCard";
import DevicesHeader from "./components/DevicesHeader";

const EmpyDevicesView = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{ height: "100%", pt: 4 }}
    >
      <Typography variant="h6"> No Devices Added </Typography>
      <br />
      <Typography variant="button">
        Please scan and add a device to get started
      </Typography>
    </Stack>
  );
};

const DevicesView = () => {
  const { root: { devices } } = useStore();

  return (
    <Box
      sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))", width: "100%" }}
    >
      <DevicesHeader />
      {devices.length === 0 && <EmpyDevicesView />}
      <Stack direction="row" justifyContent="center" height="100%" width="100%">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
            flexWrap: "wrap",
            maxWidth: 1024,
          }}
        >
          {devices.map((device) => {
            return (
              <Box key={`devicecard-${device.id}`} sx={{ margin: 1 }}>
                <DeviceCard device={device} />
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
};

export default observer(DevicesView);
