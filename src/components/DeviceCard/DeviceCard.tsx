import { observer } from "mobx-react";
import Box from "@mui/system/Box";
import { grey } from "@mui/material/colors";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Stack,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import BluetoothOnIcon from "@mui/icons-material/BluetoothOutlined";
import BluetoothConnectedIcon from "@mui/icons-material/BluetoothConnectedRounded";
import BluetoothOffIcon from "@mui/icons-material/BluetoothDisabledRounded";
import RecordIcon from "@mui/icons-material/Adjust";
import { IDevice } from "../../models/device";
import { DeviceIcon } from "../../assets/icons";
import { useMemo } from "react";

interface Props {
  device: IDevice;
}

const DeviceCard = ({ device }: Props) => {
  const history = useHistory();

  const connState = useMemo(() => {
    const description = device.state.connected ? "Connected" : device.state.online ? "Online" : "Offline";
    const color: 'primary'|'action'|'error' = device.state.connected ? "primary" : device.state.online ? "action" : "error";
    const Icon = device.state.connected ? BluetoothConnectedIcon : device.state.online ? BluetoothOnIcon : BluetoothOffIcon;
    return { description, color, Icon };
  }, [device.state.online, device.state.connected]);

  return (
    <Card
      elevation={3}
      sx={{
        m: 2,
        borderRadius: 1,
        minWidth: 300,
        maxWidth: 350,
        margin: "auto",
        backgroundColor: (theme: Theme) =>
          theme.palette.mode === "dark"
            ? `rgba(0,0,0,${device.state.online ? 0.8 : 0.6})`
            : `rgba(255,255,255,${device.state.online ? 0.9 : 0.7})`,
        backdropFilter: "blur(40px)",
      }}
    >
      <CardActionArea onClick={() => history.push(device.path)}>
        <Box
          sx={{
            p: 2,
            pb: 3,
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          {/* Device Icon */}
          <Avatar
            variant="rounded"
            sx={{ marginRight: "16px", bgcolor: "rgba(0,0,0,0)" }}
          >
            <DeviceIcon color="action" fontSize="large" />
          </Avatar>

          {/* Device Info */}
          <Stack spacing={0} sx={{ flexGrow: 1 }} alignItems="flex-start">
            <Typography fontSize={20} fontWeight={900}>
              {device.info.name}
            </Typography>
            <Stack spacing={0} flexDirection="row" alignItems="center">
              <LocationOn sx={{ color: grey[500], fontSize: 18 }} />
              <Typography fontSize={18} variant="body2" color="text.secondary">
                {device.info.location || device.info.shortId}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Device Badges */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 2 }}
        >
          <Stack direction="row" alignItems="center" justifyContent="start">
            <Tooltip arrow title={connState.description}>
              <Avatar sx={{ bgcolor: "transparent", width: 24, height: 24 }}>
                <connState.Icon fontSize="small" color={connState.color} />
              </Avatar>
            </Tooltip>
            <Typography
              variant="overline"
              color={connState.color}
              sx={{ lineHeight: "inherit" }}
              fontWeight={900}
            >
              {connState.description}
            </Typography>
          </Stack>

          {device.recording && (
            <Tooltip title="Recording">
              <Chip
                color="error"
                size="small"
                icon={<RecordIcon color="error" />}
                label={device.recordDurationStr}
              />
            </Tooltip>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default observer(DeviceCard);
