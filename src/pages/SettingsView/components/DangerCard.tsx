import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  Divider,
  Stack,
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import DangerIcon from "@mui/icons-material/WarningAmberRounded";
import { observer } from "mobx-react-lite";
import ConfirmCountDialog from "../../../components/ConfirmCountDialog";
import { useStore } from "../../../models/store";

const DangerCard = () => {
  const {
    root: { devices, records, removeAllDevices, removeAllRecords },
  } = useStore();
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmCount, setConfirmCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => Promise<void>>(
    () => async (): Promise<void> => {}
  );

  return (
    <>
      <Card>
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="danger"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <DangerIcon fontSize="large" color="error" />
            </Avatar>
          }
          title="Dangerous Actions"
        />
        <Divider />
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography> Delete All Devices </Typography>
            <Button
              size="small"
              variant="outlined"
              disableElevation
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setConfirmTitle(
                  `Are you sure you want to remove all ${devices.length} device(s) ?`
                );
                setConfirmCount(devices.length);
                setConfirmOpen(true);
                setOnConfirm(() => async () => {
                  await removeAllDevices();
                });
              }}
            >
              <Typography fontWeight={700}>Delete</Typography>
            </Button>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography> Delete All Records </Typography>
            <Button
              size="small"
              variant="outlined"
              disableElevation
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setConfirmTitle(
                  `Are you sure you want to remove all ${records.length} record(s) ?`
                );
                setConfirmCount(records.length);
                setOnConfirm(() => async () => {
                  await removeAllRecords();
                });
                setConfirmOpen(true);
              }}
            >
              <Typography fontWeight={700}>Delete</Typography>
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <ConfirmCountDialog
        title={confirmTitle}
        count={confirmCount}
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onConfirm={onConfirm}
      />
    </>
  );
};

export default observer(DangerCard);
