import { Box, Fade, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { observer } from "mobx-react-lite";
import DangerCard from "./components/DangerCard";
import UserPreferenceCard from "./components/UserPreferenceCard";
import SettingsHeader from "./components/SettingsHeader";

const SettingsView = () => {
  return (
    <Box sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))" }}>
      <SettingsHeader />
      <Fade in>
        <Stack
          direction="row"
          justifyContent="center"
          height="100%"
          width="100%"
        >
          <Grid
            m={0}
            container
            direction="row"
            spacing={1.5}
            flexGrow={0}
            justifyContent="center"
            alignContent="center"
            alignItems="center"
            p={2}
            sx={{ maxWidth: "1024px" }}
          >
            <Grid width="100%">
              <UserPreferenceCard />
            </Grid>
            <Grid width="100%">
              <DangerCard />
            </Grid>
          </Grid>
        </Stack>
      </Fade>
    </Box>
  );
};

export default observer(SettingsView);