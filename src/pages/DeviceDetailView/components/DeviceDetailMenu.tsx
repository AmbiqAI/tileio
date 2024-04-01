import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Divider, Fade, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem,
} from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { observer } from 'mobx-react';
import BluetoothIcon from '@mui/icons-material/BluetoothRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import SettingsIcon from '@mui/icons-material/DashboardCustomizeRounded';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnectedRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { IDevice } from '../../../models/device';
import DashboardSettingsDialog from '../../../components/DashboardSettingsDialog';
import { IDashboardSettings } from '../../../models/dashboardSettings';

interface Props {
  device: IDevice;
}

const DeviceDetailMenu = ({ device }: Props) => {
  const history = useHistory();
  const deviceState = device.state;
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
    <>
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


        <MenuItem key="settings" onClick={async () => {
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
          await device.delete();
          handleCloseMoreActions();
          history.push('/devices');
        }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Forget Device</ListItemText>
        </MenuItem>

      </Menu>

      <DashboardSettingsDialog
        settings={device.settings}
        open={isDeviceSettingsDialogOpen}
        onSubmit={async (settings: IDashboardSettings) => {
          device.setSettings(settings);
        }}
        onClose={() => { showDeviceSettingsDialog(false); }}
        disabled={false}
      />

    </>
  );
};


export default observer(DeviceDetailMenu);
