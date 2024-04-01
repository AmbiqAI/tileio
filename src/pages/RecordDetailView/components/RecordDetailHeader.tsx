import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Divider, Fade, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { observer } from 'mobx-react';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import EventIcon from '@mui/icons-material/AddLocationRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import Header from '../../../components/Header';
import { IRecord } from '../../../models/record';
import ShareRecordDialog from '../../../components/ShareRecordDialog';
import DashboardSettingsDialog from '../../../components/DashboardSettingsDialog';
import EventDialog from '../../../components/EventDialog';
import { IEventMarkerSet } from '../../../models/event';
import { IDashboardSettings } from '../../../models/dashboardSettings';

const RecordDetailHeader = ({ record, disabled } : {record: IRecord, disabled?: boolean }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down(500));
  const history = useHistory();
  const [isShareDialogOpen, showShareDialog] = useState(false);
  const [isEventDialogOpen, showEventDialog] = useState(false);
  const [isDashboardSettingsOpen, showDashboardSettingsDialog] = useState(false);
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);
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
          sx={{ mr: 1 }}
          onClick={async () => {
            if (!record.recording) { await record.close(); }
            history.push('/records');
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{flexGrow: 1}}>
          <Stack spacing={-0.5} sx={{flexGrow: 1}} alignItems="flex-start">
            <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight={700}>{`Record ${record.shortId}`}</Typography>
            <Stack spacing={-0.5} flexDirection="row" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {`${record.date.toLocaleDateString()} | ${record.durationHMS}`}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {!isSmall && (<IconButton
          size="large" aria-label="share" color="primary"
          disabled={disabled}
          sx={{ml: 1}}
          onClick={() => { showShareDialog(true); }}
        >
          <ShareIcon />
        </IconButton>)}
        <IconButton size="large" aria-label="more"
          color="primary" edge="end"
          onClick={handleMoreActionsClick}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id="long-menu"
          disableAutoFocusItem
          MenuListProps={{
            'aria-labelledby': 'long-button',
          }}
          TransitionComponent={Fade}
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
          <MenuItem key="share" disabled={disabled} onClick={async () => {
            handleCloseMoreActions();
            showShareDialog(true);
          }}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>

          <MenuItem key="event" disabled={disabled} onClick={async () => {
            handleCloseMoreActions();
            showEventDialog(true);
          }}>
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Events</ListItemText>
          </MenuItem>

          <MenuItem key="notification" onClick={async () => {
              showDashboardSettingsDialog(true);
              handleCloseMoreActions();
            }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>

          <Divider />
          <MenuItem key="delete" disabled={disabled} onClick={async () => {
            await record.delete();
            handleCloseMoreActions();
            history.push('/records')
          }}>
            <ListItemIcon sx={{color: 'error.main'}}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText sx={{color: 'error.main'}}>Delete Record</ListItemText>
          </MenuItem>
      </Menu>
    </Toolbar>
    <ShareRecordDialog
      open={isShareDialogOpen}
      close={() => {showShareDialog(false); }}
      record={record}
    />
    <EventDialog
      open={isEventDialogOpen}
      onSubmit={async (eventSet: IEventMarkerSet) => {
        await record.setEvents(eventSet.events);
      }}
      onClose={() => {showEventDialog(false); }}
      record={record}
    />
    <DashboardSettingsDialog
      settings={record.settings}
      open={isDashboardSettingsOpen}
      onSubmit={async (settings: IDashboardSettings) => {
        record.setSettings(settings);
      }}
      onClose={() => { showDashboardSettingsDialog(false); }}
      disabled={false}
    />
  </Header>
  )
};

export default observer(RecordDetailHeader);
