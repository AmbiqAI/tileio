import { observer } from "mobx-react";
import DownloadIcon from '@mui/icons-material/SaveAltRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import EditIcon from "@mui/icons-material/Edit";
import {
  Typography,
  Stack,
  Box,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import { IDashboard } from "../../models/dashboard";
import StyledMarkDown from "../StyledMarkDown";
import DashboardChips from "../DashboardChips";
import { useState } from "react";
import DashboardOverviewEditDialog from "./DashboardOverviewEditDialog";
import JsonUploadInput from "../JsonUploadInput";
import { Notifier } from "../../api";
import { shareJsonData } from "../utils";
import { getSnapshot } from "mobx-state-tree";

interface Props {
  dashboard: IDashboard;
}

const DashboardOverviewTab = ({ dashboard }: Props) => {
  const [isEditing, setEditing] = useState(false);

  return (
    <>
      <Box m={1} px={1} height="100%">

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" lineHeight="1.0">
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
        <Stack pt={1} spacing={1} direction="row" justifyContent="start" alignItems="start">
        <Button
          component="label"
          role={undefined}
          color="primary"
          variant="outlined"
          startIcon={<UploadIcon />}
        >
          Upload
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
          Download
        </Button>
        </Stack>

        <Divider sx={{ pt: 1 }} />

        <Typography mt={1} pb={4} variant="body1" overflow="scroll" sx={{ flexShrink: 2 }}>
          <StyledMarkDown>{dashboard.description}</StyledMarkDown>
        </Typography>
      </Box>




      <DashboardOverviewEditDialog
        open={isEditing}
        info={{ name: dashboard.name, description: dashboard.description, duration: dashboard.duration }}
        onSubmit={(info) => {
          dashboard.name = info.name;
          dashboard.description = info.description;
          dashboard.duration = info.duration;
          setEditing(false);
        }}
        onCancel={() => {
          setEditing(false);
        }}
      />
    </>
  );
}

export default observer(DashboardOverviewTab);
