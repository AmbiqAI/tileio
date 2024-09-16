import { observer } from "mobx-react";
import { IRecord } from "../../../models/record";
import { Divider, Fade, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/AddLocationRounded';
import ShareIcon from '@mui/icons-material/IosShare';

import { useState } from "react";
import { useHistory } from "react-router";
import ShareRecordDialog from "../../../components/ShareRecordDialog";
import EventDialog from "../../../components/EventDialog";
import { IEventMarkerSet } from "../../../models/event";

interface Props {
  record: IRecord;
  disabled?: boolean;
}

const RecordDetailMenu = ({ record, disabled }: Props) => {
  const history = useHistory();
  const [moreActionsAnchorEl, setMoreActionsAnchorEl] = useState<null | HTMLElement>(null);
  const openMoreActions = Boolean(moreActionsAnchorEl);
  const [isShareDialogOpen, showShareDialog] = useState(false);
  const [isEventDialogOpen, showEventDialog] = useState(false);

  const handleMoreActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreActionsAnchorEl(event.currentTarget);
  };
  const handleCloseMoreActions = () => {
    setMoreActionsAnchorEl(null);
  };
  return (
    <>
      <IconButton size="large" aria-label="more"
        sx={{ mx: 0.5, my: "auto" }}
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
        slotProps={{
          paper: {
            style: {
              maxHeight: 48 * 4.5,
              width: '20ch',
            },
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

        <Divider />
        <MenuItem key="delete" disabled={disabled} onClick={async () => {
          await record.delete();
          handleCloseMoreActions();
          history.push('/records')
        }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Record</ListItemText>
        </MenuItem>
      </Menu>
      <ShareRecordDialog
        open={isShareDialogOpen}
        close={() => { showShareDialog(false); }}
        record={record}
      />

      <EventDialog
        open={isEventDialogOpen}
        onSubmit={async (eventSet: IEventMarkerSet) => {
          await record.setEvents(eventSet.events);
        }}
        onClose={() => { showEventDialog(false); }}
        record={record}
      />
    </>
  );
};

RecordDetailMenu.defaultProps = {
  disabled: false,
};

export default observer(RecordDetailMenu);
