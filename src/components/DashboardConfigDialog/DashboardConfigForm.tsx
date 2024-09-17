import { observer } from "mobx-react";
import Grid from "@mui/material/Unstable_Grid2";
import AddTileIcon from '@mui/icons-material/DashboardCustomizeRounded';
import RestoreIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import {
  Box,
  Divider,
  FormGroup,
  IconButton,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddTileDialog from "../AddTileDialog";
import { useState } from "react";
import TilePlaceholder from "./TilePlaceholder";
import { IDashboard } from "../../models/dashboard";
import { ITileSnapshot } from "../../models/tile";

const durationOptions = [
  { label: "5 sec", value: 5 },
  ...Array(11).fill(0).map((v, i) => ({ label: "", value: 5 * (i + 1) })),
  { label: "60 sec", value: 60 },
];

interface Props {
  dashboard: IDashboard;
}

const DashboardSettingsForm = ({ dashboard }: Props) => {
  const [showAddTile, setShowAddTile] = useState(false);
  return (
    <>
      <form>
        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Name
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={dashboard.name}
            onChange={(event) => {
              dashboard.setName(event.target.value);
            }}
          />
        </FormGroup>

        <Divider />

        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Description
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            value={dashboard.description}
            onChange={(event) => {
              dashboard.setDescription(event.target.value);
            }}
          />
        </FormGroup>

        <Divider />


        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Time Window
          </Typography>
          <Box sx={{ mx: 2 }}>
            <Slider
              size="medium"
              color="secondary"
              valueLabelDisplay="auto"
              value={dashboard.duration}
              step={5}
              min={5}
              max={60}
              marks={durationOptions}
              onChange={(event, newValue, activeThumb) => {
                if (typeof newValue === "number") {
                  dashboard.setDuration(newValue);
                }
              }}
            />
          </Box>
        </FormGroup>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          my={1}
        >
          <Typography variant="h6" color="text.primary" fontWeight={400}>
            Dashboard Tiles
          </Typography>

          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
            mt={2}
            mb={1}
          >
            <Tooltip title="Add Tile" placement="top">
              <IconButton
                color="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowAddTile(true);
                }}
              >
                <AddTileIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Clear dashboard" placement="top">
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  dashboard.setTiles([]);
                }}
              >
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Box height="100%" width="100%">
          <Grid
            m={0}
            container
            rowSpacing={1.0} columnSpacing={1.0}
            justifyContent="flex-start"
            alignContent="flex-start"
            alignItems="flex-start"
            p={0}
            maxWidth="1280px"
          >
            {dashboard.tiles && dashboard.tiles.map((layout, idx) => {
              return (
                <TilePlaceholder
                  key={`card-${layout.id}`}
                  index={idx}
                  layout={layout}
                  dashboard={dashboard}
                />
              );
            })}
          </Grid>
        </Box>
      </form>
      <AddTileDialog
        open={showAddTile}
        onClose={() => {
          setShowAddTile(false);
        }}
        onSubmit={async (tile: ITileSnapshot) => {
          dashboard.addTile(-1, tile);
          setShowAddTile(false);
        }}
      />
    </>
  );
};

export default observer(DashboardSettingsForm);
