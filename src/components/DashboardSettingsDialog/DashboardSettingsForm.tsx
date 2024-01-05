import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Unstable_Grid2";
import { saveAs } from 'file-saver';
import AddTileIcon from '@mui/icons-material/DashboardCustomizeRounded';
import RestoreIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import SaveIcon from '@mui/icons-material/SaveAltRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import {
  Box,
  Divider,
  FormGroup,
  IconButton,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IDashboardSettings,
  DefaultDeviceTiles,
  ITileSnapshot,
} from "../../models/dashboardSettings";
import AddTileDialog from "../AddTileDialog";
import { useState } from "react";
import TilePlaceholder from "./TilePlaceholder";
import { getSnapshot } from "mobx-state-tree";
import { Share } from "@capacitor/share";
import { isPlatform } from "@ionic/react";
import { Device } from "@capacitor/device";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { VisuallyHiddenInput } from "../VisuallyHiddenInput";

const durationOptions = [
  { label: "5 sec", value: 5 },
  { label: "60 sec", value: 60 },
];


const DashboardSettingsForm = ({ settings }: { settings: IDashboardSettings }) => {
  const toggleStreaming = () => settings.setStreaming(!settings.streaming);
  const [showAddTile, setShowAddTile] = useState(false);
  return (
    <>
      <form>
        <FormGroup title="streaming">
          <Stack direction="row" justifyContent="space-between">
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={400}
              my={1}
            >
              Stream Signals Data
            </Typography>
            <Switch checked={settings.streaming} onChange={toggleStreaming} />
          </Stack>
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
              value={settings.duration}
              step={5}
              min={5}
              max={60}
              marks={durationOptions}
              onChange={(event, newValue, activeThumb) => {
                if (typeof newValue === "number") {
                  settings.setDuration(newValue);
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
                settings.setTiles(DefaultDeviceTiles());
              }}
            >
              <RestoreIcon />
            </IconButton>
            </Tooltip>

            <Tooltip title="Download config" placement="top">
            <IconButton
              color="primary"
              size="small"
              onClick={async () => {
                const json = getSnapshot(settings);
                const info = await Device.getInfo();
                const isMobile = isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
                const canShare = (await Share.canShare()).value;
                if (canShare && isMobile) {
                  const rst = await Filesystem.writeFile({
                    data: JSON.stringify(json),
                    recursive: false,
                    encoding: Encoding.UTF8,
                    path: 'pk-dashboard-config.json',
                    directory: Directory.Cache
                  });
                  await Share.share({
                    title: 'Dashboard Configuration',
                    dialogTitle: 'Dashboard Configuration',
                    url: rst.uri,
                  });
                } else {
                  const blob = new Blob(
                    [JSON.stringify(json)],
                    { type: "text/plain;charset=utf-8" }
                  );
                  saveAs(blob, 'settings.json');
                }
              }}
            >
              <SaveIcon />
            </IconButton>
            </Tooltip>

            <Tooltip title="Upload config" placement="top">
            <IconButton
              component="label"
              color="primary"
              size="small"
            >
              <UploadIcon />
              <VisuallyHiddenInput
                onClick={(e) => {
                  e.currentTarget.value = "";
                }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const text = e.target?.result;
                      console.log(text, typeof text);
                      if (typeof text === 'string') {
                        const json = JSON.parse(text);
                        settings.setTiles(json.tiles);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                type="file"
                accept="application/json"
                />
            </IconButton>
            </Tooltip>

          </Stack>
        </Stack>
        <Box height="100%" width="100%">
          <Grid
            m={0}
            container
            spacing={1.5}
            justifyContent="flex-start"
            alignContent="flex-start"
            alignItems="flex-start"
            p={0}
            maxWidth="1280px"
          >
            {settings.tiles.map((layout, idx) => {
              return (
                <TilePlaceholder
                  key={`card-${layout.id}`}
                  index={idx}
                  layout={layout}
                  settings={settings}
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
          settings.addTile(-1, tile);
          setShowAddTile(false);
        }}
      />
    </>
  );
};

export default observer(DashboardSettingsForm);
