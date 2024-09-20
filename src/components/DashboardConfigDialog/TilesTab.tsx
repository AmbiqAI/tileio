import { Box, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { IDashboard } from "../../models/dashboard";
import AddTileIcon from '@mui/icons-material/DashboardCustomizeRounded';
import RestoreIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import TilePlaceholder from "./TilePlaceholder";
import { observer } from "mobx-react";
import { useState } from "react";
import AddTileDialog from "../AddTileDialog";
import { ITileSnapshot } from "../../models/tile";

interface Props {
  dashboard: IDashboard;
}

const TilesTab = ({ dashboard }: Props) => {
  const [showAddTile, setShowAddTile] = useState(false);

  return (
    <>
    <Box height="100%" width="100%" p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        // p={2}
      >
        <Typography variant="h6">Tile Setup</Typography>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
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

      <Divider />

      <Grid
        mt={2}
        container
        rowSpacing={1.0} columnSpacing={1.0}
        justifyContent="flex-start"
        alignContent="flex-start"
        alignItems="flex-start"
        py={0}
      // maxWidth="1280px"
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

export default observer(TilesTab);
