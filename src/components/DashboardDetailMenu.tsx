import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Divider, Fade, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem,
} from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { observer } from 'mobx-react';
import SettingsIcon from '@mui/icons-material/DashboardCustomizeRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DashboardConfigDialog from './DashboardConfigDialog';
import ConfirmCountDialog from './ConfirmCountDialog';
import { IDashboard } from '../models/dashboard';

interface Props {
  dashboard: IDashboard;
  color: "inherit" | "primary" | "secondary" | "default";
}

const DashboardDetailMenu = ({ dashboard, color }: Props) => {
  const history = useHistory();
  const [isDashboardConfigDialogOpen, showDashboardConfigDialog] = useState(false);
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);

  const handleViewClick = async () => {
    history.push(dashboard.path);
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
        color={color} edge="end"
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
            },
          }
        }}
      >

        <MenuItem key="view"
          onClick={handleViewClick}
        >
          <ListItemIcon>
            <VisibilityRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Dashboard</ListItemText>
        </MenuItem>

        <MenuItem key="settings" onClick={async () => {
          showDashboardConfigDialog(true);
          handleCloseMoreActions();
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modify Dashboard</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem key="delete" color='red' onClick={async () => {
          setDeleteConfirmOpen(true);
          handleCloseMoreActions();
        }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Remove Dashboard</ListItemText>
        </MenuItem>

      </Menu>

      <DashboardConfigDialog
        dashboard={dashboard}
        open={isDashboardConfigDialogOpen}
        onClose={() => { showDashboardConfigDialog(false); }}
        disabled={false}
      />

      <ConfirmCountDialog
        title={"Are you sure you want to remove this dashboard?"}
        count={1}
        open={deleteConfirmOpen}
        setOpen={(open) =>
          setDeleteConfirmOpen(open)
        }
        onConfirm={async () => {
          await dashboard.delete();
          setDeleteConfirmOpen(false);
          history.push('/dashboards');
        }}
      />

    </>
  );
};

DashboardDetailMenu.defaultProps = {
  color: "primary"
}


export default observer(DashboardDetailMenu);
