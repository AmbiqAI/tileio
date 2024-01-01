import Typography from "@mui/material/Typography";
import { IconButton, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import SettingsIcon from "@mui/icons-material/Settings";
import Header from "../../../components/Header";

const SettingsHeader = () => {
  return (
    <Header>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <SettingsIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Settings
        </Typography>
      </Toolbar>
    </Header>
  );
};

export default observer(SettingsHeader);
