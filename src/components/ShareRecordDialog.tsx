import React from 'react';
import { Share } from '@capacitor/share';
import { saveAs } from 'file-saver';
import ShareIcon from '@mui/icons-material/IosShare';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  ListItemIcon, List, ListItem, ListItemButton, ListItemText, Typography, Checkbox
} from "@mui/material";
import { IRecord, RecordFormat } from '../models/record';
import { Encoding, Filesystem } from '@capacitor/filesystem';
import { Notifier } from '../api';

interface Props {
  open: boolean,
  record: IRecord, close: () => void
}

const shareOptions = [
  { name: 'CSV', key: RecordFormat.Csv },
  { name: 'SQLite', key: RecordFormat.Sqlite }
];

const ShareRecordDialog = ({ open, record, close }: Props) => {
  const [selectedFormat, setSelectedFormat] = React.useState<RecordFormat | null>(null);
  const [isBusy, setBusy] = React.useState<boolean>(false);
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open} onClose={close}
    >
      <DialogTitle >
        {`Download Record ${record.shortId}`}
      </DialogTitle>
      <DialogContent dividers>
        <Typography > Please select record format to save. </Typography>
        <List dense >
          {shareOptions.map((shareOption) => {
            return (
              <ListItem
                disablePadding
                disableGutters
                key={shareOption.key}
              >
                <ListItemButton
                  dense
                  selected={selectedFormat === shareOption.key}
                  onClick={() => {
                    setSelectedFormat(shareOption.key)
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start" disableRipple tabIndex={-1}
                      checked={selectedFormat === shareOption.key}
                      inputProps={{ 'aria-labelledby': shareOption.key }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={shareOption.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={close}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="outlined"
          loading={isBusy}
          endIcon={<ShareIcon />}
          disabled={!selectedFormat || isBusy}
          onClick={async () => {
            try {
              setBusy(true);
              if (!selectedFormat) { return; }
              const uri = await record.generateRecordUri(selectedFormat);
              const canShare = (await Share.canShare()).value;
              if (canShare) {
                setBusy(false);
                await Share.share({
                  title: 'Share Record',
                  url: uri,
                  dialogTitle: 'Share Record',
                });
              } else {
                const blob = new Blob([
                  (await Filesystem.readFile({
                    path: uri, encoding: Encoding.UTF8
                  })).data
                ], { type: "text/plain;charset=utf-8" });
                saveAs(blob, uri.substring(uri.lastIndexOf('/') + 1));
              }
            } catch (error) {
              if (`${error}`.includes("cancel")) {
              } else {
                console.error(error);
                Notifier.add({
                  message: `Error: ${error}`,
                  options: { variant: 'error' },
                });
              }
            } finally {
              setBusy(false);
              close();
            }
          }}
        >
          Share
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ShareRecordDialog;
