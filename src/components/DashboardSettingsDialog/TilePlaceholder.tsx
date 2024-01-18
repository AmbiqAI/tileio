import { observer } from "mobx-react-lite";
import Grid from "@mui/material/Unstable_Grid2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowLeftIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowRightIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ITile,
  IDashboardSettings,
} from "../../models/dashboardSettings";
import TileSettingDialog from "../TileSettingDialog";
import { InvalidTileSpec, RegisteredTiles } from "../Tiles/BaseTile";
import { useState } from "react";
import { LayoutSizeType } from "../../models/types";

type TilePlaceholderParams = {
  index: number;
  settings: IDashboardSettings;
  layout: ITile;
};

const TilePlaceholder = ({ index, settings, layout }: TilePlaceholderParams) => {
  let tileSpec = RegisteredTiles[layout.type]?.spec || null;
  const validSpec = tileSpec !== null;
  if (!validSpec) {
    tileSpec = InvalidTileSpec(layout.type);
  }

  const handleSizeChange = (
    layout: ITile,
    newSize: string | null
  ) => {
    if (newSize !== null && newSize !== layout.size) {
      layout.setSize(newSize as LayoutSizeType);
    }
  };
  const [showTileSettings, setShowTileSettings] = useState(false);

  const size = layout.size;
  const mw = size === "sm" ? 256 : size === "md" ? 512 : 1024;
  const mh = size === "sm" ? 200 : size === "md" ? 200 : 200;  // 312;
  const xs = size === "sm" ? 6 : size === "md" ? 12 : 12;
  const sm = size === "sm" ? 3 : size === "md" ? 6 : 12;
  const md = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const lg = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const xl = size === "sm" ? 2 : size === "md" ? 4 : 6;



  const disabled = !settings.streaming && (tileSpec.streamingRequired || false);

  return (
    <>
      <Grid xs={xs} sm={sm} md={md} lg={lg} xl={xl} >
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderRadius: 2,
            height: mh,
            maxWidth: mw,
            minWidth: 124,
            backgroundColor: (theme: Theme) =>
              theme.palette.mode === "dark"
                ? `rgba(0,0,0,${disabled ? 0.5 : 0.8})`
                : disabled ? 'rgba(225,225,225,0.5)' : 'rgba(255,255,255,1.0)',
          }}
        >
          <CardHeader
            sx={{ p: 1 }}
            titleTypographyProps={{
              variant: "subtitle2",
              lineHeight: "normal",
            }}
            title={layout.config.name || tileSpec.name}
            action={
              <>
              <IconButton
                size="small"
                disabled={!validSpec}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowTileSettings(true);
                }}
              >
                <EditIcon />
              </IconButton>
              </>
            }
          />
          <CardContent sx={{ py: 1, px: 1, m: 0, height: "100%" }}>
            <Stack
              height="100%"
              spacing={0.5}
              direction="column"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="body2" lineHeight="normal" color={validSpec ? "primary" : "error"}>
                {tileSpec.name}
              </Typography>

              <ToggleButtonGroup
                aria-label="size"
                value={layout.size}
                orientation="horizontal"
                color="primary"
                size="small"
                fullWidth
                exclusive
                onChange={(event, value) => {
                  handleSizeChange(layout, value);
                }}
              >
                {tileSpec.sizes.map((size) => (
                  <ToggleButton
                    key={size}
                    size="small"
                    value={size}
                    aria-label={size}
                  >
                    <Typography variant="body2" lineHeight="normal" color="text">
                      {size.toUpperCase()}
                    </Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

            </Stack>
          </CardContent>

          <CardActions
            sx={{ marginTop: "auto", justifyContent: "space-between" }}
          >
            <IconButton
              size="small"
              color="primary"
              disableTouchRipple
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                settings.moveTileToIndex(layout.id, index - 1);
              }}
            >
              <ArrowLeftIcon />
            </IconButton>

            <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  settings.removeTile(index);
                }}
              >
                <DeleteIcon />
              </IconButton>

            <IconButton
              disableTouchRipple
              color="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                settings.moveTileToIndex(layout.id, index + 1);
              }}
            >
              <ArrowRightIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <TileSettingDialog
        spec={tileSpec}
        layout={layout}
        config={layout.config}
        open={showTileSettings}
        onClose={() => {
          setShowTileSettings(false);
        }}
        onSubmit={async (config) => {
          layout.setConfig(config);
          setShowTileSettings(false);
        }}
      />
    </>
  );
};

export default observer(TilePlaceholder);
