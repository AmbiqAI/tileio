import { observer } from "mobx-react";
// import DownloadIcon from '@mui/icons-material/SaveAltRounded';
// import UploadIcon from '@mui/icons-material/UploadRounded';
import EditIcon from "@mui/icons-material/Edit";
import {
  Typography,
  Stack,
  Box,
  useTheme,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import { IDashboard } from "../../models/dashboard";
import StyledMarkDown from "../StyledMarkDown";
import DashboardChips from "../DashboardChips";
// import JsonUploadInput from "../JsonUploadInput";
// import { Notifier } from "../../api";
// import { getSnapshot } from "mobx-state-tree";
// import { shareJsonData } from "../utils";
import { useState } from "react";
import DashboardOverviewEditDialog from "./DashboardOverviewEditDialog";

interface Props {
  dashboard: IDashboard;
}

const DashboardOverviewTab = ({ dashboard }: Props) => {
  // const theme = useTheme();
  const [isEditing, setEditing] = useState(false);

  return (
    <>
      <Box m={1} px={1} height="100%">

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">
            {dashboard.name}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="end">
            <IconButton
                aria-label="edit"
                size="small"
                onClick={() => {
                  setEditing(!isEditing)
                }}
              >
                <EditIcon fontSize="medium" />
              </IconButton>
          </Stack>

        </Stack>

        <DashboardChips dashboard={dashboard} size="small" color="primary" />

        <Divider sx={{ pt: 1 }} />

        <Typography mt={1} pb={4} variant="body1" overflow="scroll" sx={{ flexShrink: 2 }}>
          <StyledMarkDown>{dashboard.description}</StyledMarkDown>
        </Typography>
      </Box>

      {/* <Stack
        direction="row"
        spacing={1}
        justifyContent="end"
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          mb: 2,
          right: 0,
          mr: 2,
          bgcolor: theme.palette.background.paper
        }}

      >
        <Button
          component="label"
          role={undefined}
          color="primary"
          variant="outlined"
          startIcon={<UploadIcon />}
        >
          Upload Config
          <JsonUploadInput
            onSubmit={(snapshot) => {
              dashboard.copyFrom(snapshot);
            }}
            onError={(error) => {
              Notifier.add({
                message: `Failed uploading configuration ${error}`,
                options: { variant: "error" },
              });
            }}
          />
        </Button>

        <Button
          color="primary"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            const json = getSnapshot(dashboard);
            shareJsonData(json, 'Dashboard Configuration', 'tio-dashboard-config.json')
          }}
        >
          Save Config
        </Button>
      </Stack> */}
      <DashboardOverviewEditDialog
        open={isEditing}
        dashboard={dashboard}
        onClose={() => setEditing(false)}
      />
    </>
  );
}

export default observer(DashboardOverviewTab);
