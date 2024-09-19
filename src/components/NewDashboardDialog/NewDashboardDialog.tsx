import { observer } from "mobx-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  Divider,
  Stack,
  CardActions,
  Avatar,
  CardHeader,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseRounded";
import { TileioIcon } from "../../assets/icons";
import UploadIcon from '@mui/icons-material/UploadRounded';
import AddIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useStore } from "../../models/store";
import { Notifier } from "../../api";

import { uuid4 } from "../../utils";
import { IDashboardSnapshot } from "../../models/dashboard";
import JsonUploadInput from "../JsonUploadInput";
import { useEffect, useState } from "react";
import BuiltDashboardSelectForm from "./BuiltinDashboardSelectForm";
import { loadDashboard } from "../../assets/dashboards";

interface Props {
  open: boolean;
  close: () => void;
}


const NewDashboardDialog = ({ open, close }: Props) => {
  const theme = useTheme();
  const { root } = useStore();

  const [dashboardName, setDashboardName] = useState<string>("");

  const onCreate = async (snapshot: IDashboardSnapshot) => {
    try {
      snapshot.id = uuid4();
      root.addDashboard(snapshot);
      Notifier.add({
        message: `Dashboard added successfully`,
        options: { variant: "success" },
      });
    } catch (error) {
      console.error('Error adding dashboard', error);
      Notifier.add({
        message: `Failed adding dashboard ${error}`,
        options: { variant: "error" },
      });
    } finally {
      close();
    }
  }

  const loadBuiltin = async (name: string) => {
    const data = await loadDashboard(name);
    if (data) {
      onCreate(data);
    }
  }

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={close}
    >
      <DialogTitle sx={{ p: 0 }}>

        <CardHeader
          title="New Dashboard Setup"
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="settings"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <TileioIcon htmlColor={theme.palette.text.primary} fontSize="medium" />
            </Avatar>
          }
          action={
            <CardActions>
              <IconButton
                aria-label="close"
                onClick={close}
              >
                <CloseIcon />
              </IconButton>

            </CardActions>
          }
        />

      </DialogTitle>

      <Divider />
      <DialogContent sx={{ bgcolor: "background.paper" }}>
        <Stack
          width="100%"
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >

          <Stack direction="row" alignItems="stretch">
            <BuiltDashboardSelectForm dashboard={dashboardName} setDashboard={setDashboardName} />
            <Button
              disabled={!dashboardName}
              variant="outlined"
              size="small"
              onClick={async () => {
                if (dashboardName) {
                  await loadBuiltin(dashboardName);
                }
              }}
            >
              Load
            </Button>
          </Stack>

          <Button
            component="label"
            role={undefined}
            color="primary"
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Upload Configuration
            <JsonUploadInput
              onSubmit={(snapshot) => {
                onCreate(snapshot);
              }}
              onError={(error) => {
                Notifier.add({
                  message: `Failed uploading dashboard ${error}`,
                  options: { variant: "error" },
                });
              }}
            />
          </Button>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              onCreate({
                id: uuid4(),
                name: "New Dashboard",
                description: "###### New Dashboard description",
              });
            }}
          >
            New Dashboard
          </Button>
        </Stack>
      </DialogContent>

    </Dialog>
  );
};

export default observer(NewDashboardDialog);
