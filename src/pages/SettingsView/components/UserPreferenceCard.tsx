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
  Stack,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightModeRounded";
import UserSettingsIcon from "@mui/icons-material/DisplaySettingsRounded";
import SystemModeIcon from "@mui/icons-material/SettingsBrightnessRounded";
import DarkModeIcon from "@mui/icons-material/DarkModeRounded";
import BleIcon from '@mui/icons-material/BluetoothConnectedRounded';
import EmulateIcon from '@mui/icons-material/BugReportRounded';
import { observer } from "mobx-react";
import { ThemeModeType } from "../../../models/settings";
import { useStore } from "../../../models/store";
import { ApiModeType } from "../../../api/types";

const UserPreferenceCard = () => {
  const {
    root: { settings },
  } = useStore();

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newThemeMode: ThemeModeType | null
  ) => {
    if (newThemeMode !== null) {
      settings.setThemeMode(newThemeMode);
    }
  };

  const handleApiChange = (
    event: React.MouseEvent<HTMLElement>,
    newApiMode: ApiModeType | null
  ) => {
    if (newApiMode !== null) {
      settings.setApiMode(newApiMode);
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
        <Stack
            direction="column"
            height="100%"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
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

        <FormGroup>
        <Typography sx={{ mb: 1 }}> API Mode </Typography>
        <ToggleButtonGroup
            value={settings.apiMode}
            exclusive
            color="info"
            onChange={handleApiChange}
            aria-label="text alignment"
          >
            <ToggleButton
              size="small"
              value={ApiModeType.live}
              aria-label="Live"
            >
              <BleIcon sx={{ mr: 1 }} />
              Live
            </ToggleButton>

            <ToggleButton
              size="small"
              value={ApiModeType.emulate}
              aria-label="Emulate"
            >
              <EmulateIcon sx={{ mr: 1 }} />
              Emulate
            </ToggleButton>

          </ToggleButtonGroup>
          <Typography variant="caption" sx={{ mt: 1 }}>
            App restart is required for changes to take effect.
          </Typography>
        </FormGroup>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default observer(UserPreferenceCard);
