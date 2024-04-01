import { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/CheckCircleOutline";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";
import { observer } from "mobx-react";
import { EventMarker, IEventMarkerSet } from "../../models/event";

interface EventTableProps {
  eventSet: IEventMarkerSet;
}

export const EventTable = ({ eventSet }: EventTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ fontSize: "16px" }}> Timestamp </TableCell>
            <TableCell sx={{ fontSize: "16px" }}> Event </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eventSet.events.map((e) => (
            <TableRow>
              <TableCell> {e.formattedTime} </TableCell>
              <TableCell> {e.name} </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface EventEditTableProps {
  eventSet: IEventMarkerSet;
  setEventSet: (events: IEventMarkerSet) => void;
  startDate: Date;
  endDate: Date;
}
export const EventEditTable = observer(
  ({ eventSet, startDate, endDate }: EventEditTableProps) => {
    const [newEvent, setNewEvent] = useState({
      ts: endDate.valueOf(),
      name: "",
    });

    useEffect(() => {
      setNewEvent({ ts: endDate.valueOf(), name: "" });
    }, [endDate]);

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ fontSize: "16px" }}> Timestamp </TableCell>
              <TableCell sx={{ fontSize: "16px" }}> Event </TableCell>
              <TableCell sx={{ fontSize: "16px" }}> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventSet.events.map((event) => (
              <TableRow>
                <TableCell size="small"> {event.formattedTime} </TableCell>
                <TableCell size="small" sx={{ px: 0, mx: 0 }}>
                  <TextField
                    margin="none"
                    size="small"
                    autoComplete="off"
                    type="text"
                    value={event.name}
                    onChange={(e) => {
                      event.setName(e.target.value);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => {
                      eventSet.remove(event.ts);
                    }}
                  >
                    <RemoveIcon fontSize="medium" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell size="small">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    minDateTime={startDate}
                    maxDateTime={endDate}
                    label="Time"
                    timeSteps={{
                      hours: 1,
                      minutes: 1,
                      seconds: 1,
                    }}
                    views={[
                      "year",
                      "month",
                      "day",
                      "hours",
                      "minutes",
                      "seconds",
                    ]}
                    value={new Date(newEvent.ts)}
                    onChange={(e) => {
                      setNewEvent({
                        ...newEvent,
                        ts: e?.valueOf() || endDate.valueOf(),
                      });
                    }}
                    // renderInput={(params) => (
                    //   <TextField
                    //     fullWidth
                    //     margin="normal"
                    //     size="small"
                    //     inputProps={{ spellCheck: false }}
                    //     autoComplete="off"
                    //     disabled
                    //     {...params}
                    //   />
                    // )}
                  />
                </LocalizationProvider>
              </TableCell>

              <TableCell size="small" sx={{ px: 0, mx: 0 }}>
                <TextField
                  margin="none"
                  size="small"
                  label="Name"
                  autoComplete="off"
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, name: e.target.value });
                  }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label="add"
                  size="small"
                  disabled={!newEvent.ts || !newEvent.name}
                  onClick={() => {
                    eventSet.add(EventMarker.create(newEvent));
                    setNewEvent({ ts: endDate.valueOf(), name: "" });
                  }}
                >
                  <AddIcon fontSize="medium" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

export default observer(EventTable);
