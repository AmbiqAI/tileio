import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Divider, Fade, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem,
} from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { observer } from 'mobx-react';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import SettingsIcon from '@mui/icons-material/DashboardCustomizeRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { IDevice } from '../models/device';
import DeviceStateIcon from './DeviceStateIcon';
import DashboardSettingsDialog from './DashboardSettingsDialog';
import { IDashboardSettings } from '../models/dashboardSettings';
import ConfirmCountDialog from './ConfirmCountDialog';

interface Props {
  device: IDevice;
}

const DeviceDetailMenu = ({ device }: Props) => {
  const history = useHistory();
  const deviceState = device.state;
  const [isDeviceSettingsDialogOpen, showDeviceSettingsDialog] = useState(false);
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);

  const handleConnectClick = async () => {
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
        slotProps={{
          paper: {
          style: {
              maxHeight: 48 * 5.5,
              width: '20ch',
            },
          }
        }}
      >

        <MenuItem key="connect"
          disabled={deviceState.connecting || deviceState.disconnecting || !deviceState.online}
          onClick={handleConnectClick}
        >
          <ListItemIcon>
            <DeviceStateIcon type={device.info.type} online={deviceState.online} connected={deviceState.connecting} />
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
          setDeleteConfirmOpen(true);
          handleCloseMoreActions();
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

      <ConfirmCountDialog
        title={"Are you sure you want to forget this device?"}
        count={1}
        open={deleteConfirmOpen}
        setOpen={(open) =>
          setDeleteConfirmOpen(open)
        }
        onConfirm={async () => {
          await device.delete();
          setDeleteConfirmOpen(false);
          history.push('/devices');
        }}
      />

    </>
  );
};


export default observer(DeviceDetailMenu);
