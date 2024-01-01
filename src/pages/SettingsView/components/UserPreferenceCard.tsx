import {
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightModeRounded";
import UserSettingsIcon from "@mui/icons-material/DisplaySettingsRounded";
import SystemModeIcon from "@mui/icons-material/SettingsBrightnessRounded";
import DarkModeIcon from "@mui/icons-material/DarkModeRounded";
import { observer } from "mobx-react-lite";
import { ThemeModeType } from "../../../models/settings";
import { useStore } from "../../../models/store";

const UserPreferenceCard = () => {
  const {
    root: { settings },
  } = useStore();

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ThemeModeType | null
  ) => {
    if (newViewMode !== null) {
      settings.setThemeMode(newViewMode);
    }
  };
  return (
    <Card>
      <CardHeader
        titleTypographyProps={{ variant: "h6" }}
        avatar={
          <Avatar
            variant="rounded"
            aria-label="user settings"
            sx={{ bgcolor: "rgba(0,0,0,0)" }}
          >
            <UserSettingsIcon fontSize="large" color="info" />
          </Avatar>
        }
        title="User Preferences"
      />
      <Divider />
      <CardContent>
        <FormGroup title="Theme Mode">
          <Typography sx={{ mb: 1 }}> Theme Mode </Typography>
          <ToggleButtonGroup
            value={settings.themeMode}
            exclusive
            color="info"
            onChange={handleThemeChange}
            aria-label="text alignment"
          >
            <ToggleButton
              size="small"
              value={ThemeModeType.light}
              aria-label="light"
            >
              <LightModeIcon sx={{ mr: 1 }} /> Light
            </ToggleButton>
            <ToggleButton
              size="small"
              value={ThemeModeType.system}
              aria-label="system"
            >
              <SystemModeIcon sx={{ mr: 1 }} /> System
            </ToggleButton>
            <ToggleButton
              size="small"
              value={ThemeModeType.dark}
              aria-label="dark"
            >
              <DarkModeIcon sx={{ mr: 1 }} /> Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default observer(UserPreferenceCard);
