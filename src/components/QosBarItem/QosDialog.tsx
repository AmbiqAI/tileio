import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Divider,
  Stack,
  Box,
  CardHeader,
  Avatar,
  CardActions,
  IconButton,
} from "@mui/material";
import QosIcon from '@mui/icons-material/SensorsRounded';
import CloseIcon from '@mui/icons-material/Close';
import { ISlot } from "../../models/slot";
import { IDashboard } from "../../models/dashboard";
import SlotQosCard from "./SlotQosCard";


interface Props {
  open: boolean;
  onClose: () => void;
  dashboard: IDashboard;
  slots: ISlot[];
}

const QosDialog = ({ open, onClose, dashboard, slots }: Props) => {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle sx={{ p: 0 }}>
      <CardHeader
          title="QoS State"
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="device"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <QosIcon color="action" fontSize="large" />
            </Avatar>
          }
          action={
            <CardActions>
              <IconButton
                aria-label="close"
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            </CardActions>
          }
        />
      </DialogTitle>
      <Divider />
      <DialogContent style={{padding: 0}}>
          <Box
            sx={{
              m: 0,
              display: "flex",
              justifyContent: "center",
              p: 2,
              flexWrap: "wrap",
            }}
          >
            {slots.map((slot, index) => (
              <Box key={`slot-${index}`} sx={{ margin: 1 }}>
                <SlotQosCard qos={slot.mask.qosState} config={dashboard.device.slots[index]} index={index} />
              </Box>
            ))}
          </Box>

      </DialogContent>
    </Dialog>
  );
};


export default observer(QosDialog);
