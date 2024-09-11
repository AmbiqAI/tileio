import { observer } from "mobx-react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";
import { useStore } from "../../models/store";
import DashboardsHeader from "./components/DashboardsHeader";
import DashboardCard from "../../components/DashboardCard";
import AddDashboardCard from "./components/AddDashboardCard";


const EmpyDashboardsView = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{ height: "100%", pt: 4 }}
    >
      <Typography variant="h6"> No Dashboards Added </Typography>
      <br />
      <Typography variant="button">
        Please add a dashboard to get started
      </Typography>
    </Stack>
  );
};

const DashboardsView = () => {
  const { root: { dashboards, device } } = useStore();

  return (
    <Box
      sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))", width: "100%" }}
    >
      <DashboardsHeader />
      {dashboards.length === 0 && <EmpyDashboardsView />}
      <Stack direction="row" justifyContent="center" height="100%" width="100%">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
            flexWrap: "wrap",
            maxWidth: 1560,
          }}
        >
          {dashboards.map((dashboard) => {
            return (
              <Box key={`dashboard-${dashboard.id}`} sx={{ margin: 1 }}>
                <DashboardCard dashboard={dashboard} device={device?.dashboard?.id === dashboard.id ? device : null} />
              </Box>
            );
          })}
          {dashboards.length === 0 && (
            <Box sx={{ margin: 1 }}>
              <AddDashboardCard />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default observer(DashboardsView);
