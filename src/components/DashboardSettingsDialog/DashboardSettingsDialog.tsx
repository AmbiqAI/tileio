import { useState } from "react";
import { observer } from "mobx-react-lite";
import { saveAs } from 'file-saver';
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/CancelPresentationOutlined";
import SaveIcon from '@mui/icons-material/SaveAltRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

import DashboardSettingsForm from "./DashboardSettingsForm";
import { clone, getSnapshot } from "mobx-state-tree";
import {
  Avatar,
  CardActions,
  CardHeader,
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import { IDashboardSettings } from "../../models/dashboardSettings";
import { Device } from "@capacitor/device";
import { isPlatform } from "@ionic/react";
import { Share } from "@capacitor/share";
import { VisuallyHiddenInput } from "../VisuallyHiddenInput";

interface Props {
  settings: IDashboardSettings;
  open: boolean;
  onClose: () => void;
  onSubmit: (info: IDashboardSettings) => Promise<void>;
  disabled: boolean;
}

const DashboardSettingsDialog = ({
  settings,
  open,
  onSubmit,
  onClose,
  disabled,
}: Props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [draftSettings, setDraftSettings] = useState(clone(settings));

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={() => {
        if (isEditing) {
          return;
        }
        onClose();
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="settings"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <SettingsIcon color="action" fontSize="large" />
            </Avatar>
          }
          action={
            <CardActions>
              <IconButton
                aria-label="edit"
                size="small"
                disabled={disabled || isSubmitting}
                onClick={() => {
                  if (!isEditing) {
                    setEditing(true);
                    setDraftSettings(clone(settings));
                  } else {
                    setEditing(false);
                  }
                }}
              >
                {isEditing ? (
                  <CancelIcon fontSize="large" />
                ) : (
                  <EditIcon fontSize="medium" />
                )}
              </IconButton>

              <Tooltip title="Download config" placement="top">
              <IconButton
                size="small"
                onClick={async () => {
                  const json = getSnapshot(settings);
                  const info = await Device.getInfo();
                  const isMobile = isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
                  const canShare = (await Share.canShare()).value;
                  if (canShare && isMobile) {
                    const rst = await Filesystem.writeFile({
                      data: JSON.stringify(json),
                      recursive: false,
                      encoding: Encoding.UTF8,
                      path: 'tio-dashboard-config.json',
                      directory: Directory.Cache
                    });
                    await Share.share({
                      title: 'Dashboard Configuration',
                      dialogTitle: 'Dashboard Configuration',
                      url: rst.uri,
                    });
                  } else {
                    const blob = new Blob(
                      [JSON.stringify(json)],
                      { type: "text/plain;charset=utf-8" }
                    );
                    saveAs(blob, 'tio-dashboard-config.json');
                  }
                }}
              >
              <SaveIcon />
            </IconButton>
            </Tooltip>

            <Tooltip title="Upload config" placement="top">
            <IconButton
              component="label"
              size="small"
            >
              <UploadIcon />
              <VisuallyHiddenInput
                onClick={(e) => {
                  e.currentTarget.value = "";
                }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const text = e.target?.result;
                      if (typeof text === 'string') {
                        const json = JSON.parse(text);
                        setDraftSettings(json);
                        await onSubmit(json);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                type="file"
                accept="application/json"
                />
            </IconButton>
            </Tooltip>


            </CardActions>
          }
          title="Dashboard Settings"
        />
      </DialogTitle>

      <Divider />

      <DialogContent>
        {isEditing ? (
          <Typography variant="body2" color="textSecondary" component="div">
            <DashboardSettingsForm settings={draftSettings} />
          </Typography>
        ) : (
          <>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Duration
              </Typography>
              <Typography variant="body1">

                {`${settings.duration} sec`}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Streaming
              </Typography>
              <Typography variant="body1">
                {settings.streaming ? "Enabled" : "Disabled"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Dashboard Tiles
              </Typography>
              <Typography variant="body1">
                {`${settings.tiles.length} Tiles`}
              </Typography>
            </Stack>
          </>
        )}
      </DialogContent>

      <Divider />

      {isEditing ? (
        <DialogActions>
          <Button
            variant="outlined"
            onClick={async () => {
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={disabled}
            variant="outlined"
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(draftSettings);
              setEditing(false);
              setSubmitting(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      ) : (
        <DialogActions sx={{ mr: 2, mb: 1 }}></DialogActions>
      )}
    </Dialog>
  );
};

export default observer(DashboardSettingsDialog);
