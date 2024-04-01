import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { clone } from "mobx-state-tree";
import {
  Avatar,
  Button,
  CardActions,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import EventIcon from "@mui/icons-material/AddLocation";
import CancelIcon from "@mui/icons-material/CancelPresentationOutlined";
import EditIcon from "@mui/icons-material/Edit";
import EventTable, { EventEditTable } from "./EventTable";
import { IRecord } from "../../models/record";
import { EventMarkerSet, IEventMarkerSet } from "../../models/event";


interface Props {
  open: boolean;
  record: IRecord;
  onClose: () => void;
  onSubmit: (events: IEventMarkerSet) => Promise<void>;
}

const EventDialog = ({ open, record, onSubmit, onClose }: Props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [draftEventSet, setDraftEventSet] = useState<IEventMarkerSet>(
    EventMarkerSet.create({ events: [] })
  );
  const [eventSet, setEventSet] = useState<IEventMarkerSet>(
    EventMarkerSet.create({ events: [] })
  );

  useEffect(() => {
    record.getEvents().then((events) => {
      setEventSet(EventMarkerSet.create({ events: events }));
    });
  }, [record]);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onBackdropClick={() => {
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
              <EventIcon color="action" fontSize="large" />
            </Avatar>
          }
          action={
            <CardActions>
              <IconButton
                aria-label="edit"
                size="small"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!isEditing) {
                    setDraftEventSet(clone(eventSet));
                    setEditing(true);
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
            </CardActions>
          }
          title="Events"
        />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 0, pt: 0, maxHeight: "400px" }}>
        {isEditing ? (
          <EventEditTable
            eventSet={draftEventSet}
            setEventSet={setDraftEventSet}
            startDate={record.date}
            endDate={
              new Date(record.date.valueOf() + 1000 * record.duration + 5000)
            }
          />
        ) : (
          <EventTable eventSet={eventSet} />
        )}
      </DialogContent>
      {isEditing && (
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
            variant="outlined"
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(draftEventSet);
              setEventSet(draftEventSet);
              setEditing(false);
              setSubmitting(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default observer(EventDialog);
