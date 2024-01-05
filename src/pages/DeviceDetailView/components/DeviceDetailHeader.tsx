import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  Button, Divider, Fade, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Stack, Toolbar, useMediaQuery
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Header from '../../../components/Header';
import { observer } from 'mobx-react-lite';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import StartRecordIcon from '@mui/icons-material/FiberManualRecordRounded';
import StopRecordIcon from '@mui/icons-material/StopCircleRounded';
import BluetoothIcon from '@mui/icons-material/BluetoothRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import EventIcon from '@mui/icons-material/AddLocationRounded';
import SettingsIcon from '@mui/icons-material/DashboardCustomizeRounded';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnectedRounded';
import BluetoothOffIcon from '@mui/icons-material/BluetoothDisabledRounded';
import MoreIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import BatteryIcon from '../../../components/BatteryIcon';
import SignalIcon from '../../../components/SignalIcon';
import { IDevice } from '../../../models/device';
import { useStore } from '../../../models/store';
import DeviceInfoDialog from '../../../components/DeviceInfoDialog';
import { IDeviceInfo } from '../../../models/deviceInfo';
import NavButton from '../../../components/NavButton';
import DeviceViewSettingsDialog from '../../../components/DashboardSettingsDialog';
import { IDashboardSettings } from '../../../models/dashboardSettings';
import { useTheme } from '@mui/system';

const DeviceDetailHeader = ({ device }: { device: IDevice }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down(500));
  const history = useHistory();
  const { root: { removeDevice } } = useStore();
  const deviceState = device.state;
  const [isDeviceInfoDialogOpen, showDeviceInfoDialog] = useState(false);
  const [isDeviceSettingsDialogOpen, showDeviceSettingsDialog] = useState(false);
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);
  const BluetoothStateIcon = deviceState.connected ? BluetoothConnectedIcon : BluetoothIcon;
  const handleBluetoothClick = async () => {
    if (deviceState.connected) { await device.disconnect(); }
    else { await device.connect(); }
    handleCloseMoreActions();
  };
  const handleMoreActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreActionsAnchorEl(event.currentTarget);
  };
  const handleCloseMoreActions = () => {
    setMoreActionsAnchorEl(null);
  };
  return (
    <Header>
      <Toolbar>
        <IconButton
          size="large" edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 0.5 }}
          onClick={() => history.push('/devices')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <NavButton
            onClick={() => { showDeviceInfoDialog(true); }}
          >
            <Stack spacing={-0.5} sx={{ flexGrow: 1 }} alignItems="flex-start">
              <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight={700}>{device.info.name}</Typography>
              {!deviceState.online ? (
                <Stack spacing={-0.1} flexDirection="row" alignItems="center">
                  <BluetoothOffIcon fontSize="small" color="error" sx={{ fontSize: 16 }} />
                  <Typography variant="overline" color="error" sx={{ lineHeight: 'normal' }}> Offline </Typography>
                </Stack>
              ) : (
                <Stack direction="row" spacing={0.2} flexDirection="row" alignItems="center">
                  <Typography variant="subtitle2" color="text.secondary">
                    {device.info.location || device.info.shortId}
                  </Typography>
                  <BatteryIcon level={deviceState.batteryLevel} color={deviceState.connected ? "inherit" : "disabled"} sx={{ fontSize: 16 }} />
                  <SignalIcon level={deviceState.signalStrength} color={deviceState.connected ? "inherit" : "disabled"} sx={{ fontSize: 16 }} />
                  {deviceState.connected && (<BluetoothConnectedIcon sx={{ fontSize: 16 }} />)}
                </Stack>
              )}
            </Stack>
          </NavButton>
        </Box>

        <Stack flexDirection="row" justifyContent="center">
          <Button sx={{ p: 1 }} variant="outlined" color={device.recording ? "error" : "primary"} aria-label="Record"
            disabled={!deviceState.connected}
            onClick={async () => {
              if (device.recording) {
                await device.stopRecording();
              } else {
                await device.startRecording();
              }
            }}
          >
            <Stack direction="row">
              {device.recording ? <StopRecordIcon /> : <StartRecordIcon />}
              {device.recording && (
                <Typography sx={{ ml: 0.2 }} variant="button">
                  {device.recordDurationStr}
                </Typography>
              )}
            </Stack>
          </Button>

          {!isSmall && (<LoadingButton
            sx={{ ml: 0.5 }}
            disabled={deviceState.connecting || deviceState.disconnecting || !deviceState.online}
            loading={deviceState.connecting || deviceState.disconnecting}
            loadingPosition="center"
            variant="outlined"
            onClick={handleBluetoothClick}
          >
            <BluetoothStateIcon sx={{ opacity: deviceState.connecting || deviceState.disconnecting ? 0 : 1 }} />
          </LoadingButton>
          )}
          <IconButton size="large" aria-label="more"
            color="primary" edge="end"
            onClick={handleMoreActionsClick}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="long-menu"
            disableAutoFocusItem
            TransitionComponent={Fade}
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={moreActionsAnchorEl}
            open={openMoreActions}
            onClose={handleCloseMoreActions}
            PaperProps={{
              style: {
                maxHeight: 48 * 5.5,
                width: '20ch',
              },
            }}
          >

            <MenuItem key="connect"
              disabled={deviceState.connecting || deviceState.disconnecting || !deviceState.online}
              onClick={handleBluetoothClick}
            >
              <ListItemIcon>
                <BluetoothStateIcon />
              </ListItemIcon>
              <ListItemText>{deviceState.connected ? "Disconnect" : "Connect"}</ListItemText>
            </MenuItem>

            <MenuItem key="event" disabled={!device.recording} onClick={async () => {
              if (device.recording && device.record) {
                await device.record?.addEvent();
              }
              handleCloseMoreActions();
            }}>
              <ListItemIcon>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Event</ListItemText>
            </MenuItem>

            <MenuItem key="notification" onClick={async () => {
              showDeviceSettingsDialog(true);
              handleCloseMoreActions();
            }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>

            <MenuItem key="refresh" onClick={async () => {
              await device.refresh();
              handleCloseMoreActions();
            }}>
              <ListItemIcon>
                <RefreshIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Refresh</ListItemText>
            </MenuItem>

            <Divider />
            <MenuItem key="delete" color='red' onClick={async () => {
              await removeDevice(device.id);
              handleCloseMoreActions();
              history.push('/devices');
            }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Forget Device</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
      <DeviceInfoDialog
        open={isDeviceInfoDialogOpen}
        info={device.info}
        batteryLevel={deviceState.batteryLevel}
        signalStrength={deviceState.signalStrength}
        lastSeenDate={device.seenDate}
        onSubmit={async (info: IDeviceInfo) => {
          device.setInfo(info)
        }}
        onClose={() => { showDeviceInfoDialog(false); }}
        disabled={false}
      />

      <DeviceViewSettingsDialog
        settings={device.settings}
        open={isDeviceSettingsDialogOpen}
        onSubmit={async (settings: IDashboardSettings) => {
          device.setSettings(settings);
        }}
        onClose={() => { showDeviceSettingsDialog(false); }}
        disabled={false}
      />
    </Header>
  )
};

export default observer(DeviceDetailHeader);
