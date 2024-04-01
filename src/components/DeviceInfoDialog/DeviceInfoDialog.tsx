import React from "react";
import { saveAs } from 'file-saver';
import { observer } from "mobx-react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/CancelPresentationOutlined";
import DeviceInfoForm from "./DeviceInfoForm";
import SaveIcon from '@mui/icons-material/SaveAltRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
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
  useTheme,
} from "@mui/material";
import { DeviceIcon } from "../../assets/icons";
import { IDeviceInfo } from "../../models/deviceInfo";
import BatteryIcon from "../BatteryIcon";
import SignalIcon from "../SignalIcon";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import { lightTheme } from "@uiw/react-json-view/light";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { isPlatform } from "@ionic/react";
import { Device } from "@capacitor/device";
import { VisuallyHiddenInput } from "../VisuallyHiddenInput";

interface Props {
  open: boolean;
  info: IDeviceInfo;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeenDate?: Date;
  onClose: () => void;
  onSubmit: (info: IDeviceInfo) => Promise<void>;
  disabled: boolean;
}

const DeviceInfoDialog = ({
  open,
  info,
  batteryLevel,
  signalStrength,
  lastSeenDate,
  onSubmit,
  onClose,
  disabled,
}: Props) => {
  const theme = useTheme();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [isEditing, setEditing] = React.useState(false);
  const [draftInfo, setDraftInfo] = React.useState<IDeviceInfo>(clone(info));
  const jsonTheme = theme.palette.mode === 'dark' ? darkTheme : lightTheme;
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
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
              aria-label="device"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <DeviceIcon color="action" fontSize="large" />
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
                    setDraftInfo(clone(info));
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

              <IconButton
              size="small"
              onClick={async () => {
                const json = getSnapshot(info);
                const devinfo = await Device.getInfo();
                const isMobile = isPlatform("ios") || isPlatform("android") || devinfo.platform === 'ios';
                const canShare = (await Share.canShare()).value;
                if (canShare && isMobile) {
                  const rst = await Filesystem.writeFile({
                    data: JSON.stringify(json),
                    recursive: false,
                    encoding: Encoding.UTF8,
                    path: 'tio-device-config.json',
                    directory: Directory.Cache
                  });
                  await Share.share({
                    title: 'Device Configuration',
                    dialogTitle: 'Device Configuration',
                    url: rst.uri,
                  });
                } else {
                  const blob = new Blob(
                    [JSON.stringify(json)],
                    { type: "text/plain;charset=utf-8" }
                  );
                  saveAs(blob, 'tio-device-config.json');
                }
              }}
            >
              <SaveIcon />
            </IconButton>

            <IconButton
              component="label"
              size="small"
            >
              <UploadIcon />
              <VisuallyHiddenInput
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const text = e.target?.result;
                      if (typeof text === 'string') {
                        const json = JSON.parse(text);
                        setDraftInfo(json);
                        await onSubmit(json);
                      }
                    };
                    reader.readAsText(file);
                  }
                  e.currentTarget.value = "";
                }}
                type="file"
                accept="application/json"
                />
            </IconButton>
            </CardActions>
          }
          title={info.name}
          subheader={
            `${info.location} ${info.location ? " | " : ""} ${info.shortId}`
          }
        />
      </DialogTitle>

      <Divider />

      <DialogContent>
        {isEditing ? (
          <Typography variant="body2" color="textSecondary" component="div">
            <DeviceInfoForm
              info={draftInfo}
              setInfo={(info: IDeviceInfo) => {
                setDraftInfo(info);
              }}
            />
          </Typography>
        ) : (
          <>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                ID
              </Typography>
              <Typography variant="body1"> {info.shortId || "NA"} </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Name
              </Typography>
              <Typography variant="body1"> {info.name || "NA"} </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Location
              </Typography>
              <Typography variant="body1"> {info.location || "NA"} </Typography>
            </Stack>
            {lastSeenDate && (
              <Stack direction="row" alignItems="center">
                <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                  Last Seen
                </Typography>
                <Typography variant="body1">
                  {lastSeenDate.toLocaleString()}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="flex-start">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                Slots
              </Typography>
              <JsonView value={info.slots} style={{marginTop: "8px", width: "100%", ...jsonTheme}}/>
            </Stack>
            <Stack direction="row" alignItems="flex-start">
              <Typography sx={{ mr: 2, color: "primary.main" }} variant="h6">
                UIO
              </Typography>
              <JsonView value={info.uio} style={{marginTop: "8px", width: "100%", ...jsonTheme}}/>
            </Stack>

          </>
        )}
      </DialogContent>

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
              await onSubmit(draftInfo);
              setEditing(false);
              setSubmitting(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      ) : (
        <DialogActions
          sx={{ mr: 2, mb: 1, color: disabled ? "gray" : "inherit" }}
        >
          {batteryLevel !== undefined && (
            <>
              <Typography textAlign="right" minWidth={"32px"}>
                {`${batteryLevel.toFixed(0)}%`}
              </Typography>
              <BatteryIcon
                level={batteryLevel}
                color={disabled ? "disabled" : "inherit"}
                sx={{ fontSize: 20 }}
              />
            </>
          )}
          {signalStrength !== undefined && (
            <>
              <Typography textAlign="right" minWidth={"32px"}>
                {`${signalStrength.toFixed(0)}%`}
              </Typography>
              <SignalIcon
                level={signalStrength}
                color={disabled ? "disabled" : "inherit"}
                sx={{ fontSize: 20 }}
              />
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default observer(DeviceInfoDialog);
