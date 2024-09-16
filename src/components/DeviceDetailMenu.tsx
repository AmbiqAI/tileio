import { useState } from 'react';
import {
  Divider, Fade, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem,
} from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { observer } from 'mobx-react';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import DeviceStateIcon from './DeviceStateIcon';
import DeviceDialog from './DeviceDialog';
import { IDevice } from '../models/device';
import { useStore } from '../models/store';
import { IDashboard } from '../models/dashboard';

interface Props {
  dashboard: IDashboard;
  device?: IDevice;
}

const DeviceDetailMenu = ({ device, dashboard }: Props) => {
  const { root: { clearActiveDevice } } = useStore();
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);

  const [isDeviceDialogOpen, showDeviceDialog] = useState(false);

  const handleConnectClick = async () => {
    if (device === undefined) { return; }
    if (device.state.connected) { await device.disconnect(); }
    else { await device.connect(dashboard); }
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
      <IconButton sx={{margin: "auto"}} size="large" aria-label="more"
        edge="end"
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
              // width: '20ch',
            },
          }
        }}
      >

        {!!device && (
          <MenuItem key="connect"
            disabled={device.state.connecting || device.state.disconnecting || !device.state.online}
            onClick={handleConnectClick}
          >
            <ListItemIcon>
              <DeviceStateIcon type={device.type} online={device.state.online} connected={device.state.connecting} />
            </ListItemIcon>
            <ListItemText>{device.state.connected ? "Disconnect" : "Connect"}</ListItemText>
          </MenuItem>
        )}

        <MenuItem key="refresh" onClick={async () => {
          showDeviceDialog(true);
          handleCloseMoreActions();
        }}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Select Device</ListItemText>
        </MenuItem>

        {!!device && (
          <div>
            <Divider />
            <MenuItem
              key="delete"
              color='red'
              onClick={async () => {
                await clearActiveDevice();
                handleCloseMoreActions();
              }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Forget Device</ListItemText>
            </MenuItem>
          </div>
        )}

      </Menu>

      <DeviceDialog
        dashboard={dashboard}
        open={isDeviceDialogOpen}
        close={() => { showDeviceDialog(false); }}
      />

    </>
  );
};


export default observer(DeviceDetailMenu);
