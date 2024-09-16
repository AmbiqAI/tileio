import { observer } from "mobx-react";
import { matchPath } from "react-router";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import SettingsIcon from "@mui/icons-material/Settings";
import { TileioIcon } from "../assets/icons";

function getActiveTab(path: string) {
  if (matchPath(path, { path: "/settings" }) != null) {
    return "/settings";
  }
  if (matchPath(path, { path: "/dashboards" }) != null) {
    return "/dashboards";
  }
  if (matchPath(path, { path: "/records" }) != null) {
    return "/records";
  }
  return "/dashboards";
}

function NavBar() {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);
  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation value={activeTab} showLabels>
        <BottomNavigationAction
          label="Dashboards"
          value="/dashboards"
          icon={<TileioIcon />}
          component={RouterLink}
          to={"/devices"}
        />
        <BottomNavigationAction
          label="Records"
          value="/records"
          icon={<ArchiveIcon />}
          component={RouterLink}
          to={"/records"}
        />
        <BottomNavigationAction
          label="Settings"
          value="/settings"
          icon={<SettingsIcon />}
          component={RouterLink}
          to={"/settings"}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default observer(NavBar);
