import { observer } from "mobx-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  CardActions,
  Avatar,
  CardHeader,
  Divider,
  IconButton,
} from "@mui/material";
import { DeviceIcon } from "../../assets/icons";
import CloseIcon from '@mui/icons-material/Close';

import { useStore } from "../../models/store";
import { IDashboard } from "../../models/dashboard";
import DeviceSelectForm from "./DeviceSelectForm";
import DeviceInfoForm from "./DeviceInfoForm";
import DeviceChips from "../DeviceChips";


interface Props {
  dashboard: IDashboard;
  open: boolean;
  close: () => void;
}

const DeviceDialog = ({ dashboard, open, close }: Props) => {
  const { root: { device } } = useStore();

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => {
        close();
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
              <DeviceIcon color="action" fontSize="large" />
            </Avatar>
          }
          action={
            <CardActions>
              {!!device && (
                <DeviceChips device={device} size="small" color="primary" />
              )}
              <IconButton
                aria-label="close"
                onClick={close}
              >
                <CloseIcon />
              </IconButton>
            </CardActions>
          }
          title="Device Settings"
        />

      </DialogTitle>

      <Divider />
      <DialogContent sx={{ bgcolor: "background.paper", p: 1 }}>

        {!device ? (
          <DeviceSelectForm />
        ) : (
          <DeviceInfoForm
            device={device}
            dashboard={dashboard}
          />
        )}

      </DialogContent>

    </Dialog>
  );
};

export default observer(DeviceDialog);
