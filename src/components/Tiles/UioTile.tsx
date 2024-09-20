import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useMemo } from "react";
import IoControl from "../IoControl";
import { ThemeColors } from "../../theme/theme";
import TileCornerLabel from "./TileCornerLabel";

export const UioTileSpec: TileSpec = {
  type: "UIO_TILE",
  name: "UIO Tile",
  description: "Control user I/O",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: "object",
    required: ["name", "ios"],
    properties: {
      name: {
        type: "string",
        default: "UIO",
        title: "Tile name",
        description: "Tile name",
      },
      ios: {
        type: "array",
        title: "I/O",
        items: {
          type: "integer",
          enum: [0, 1, 2, 3, 4, 5, 6, 7]
        },
        uniqueItems: true
      },
    },
  },
  uischema: {
    "ios": {
      "ui:widget": "checkboxes",
      "ui:options": {
        "inline": true
      }
    },
  }
};

export interface UioTileConfig {
  name: string;
  ios: number[];
}

export function parseConfig(config: { [key: string]: any }): UioTileConfig {
  const configs = {
    name: "",
    ios: [],
    ...config,
  } as UioTileConfig;
  return configs;
}

const UioTile = observer(({ config, uioState, dashboard, pause, size }: TileProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const onChange = async (io: number, state: number) => {
    if (uioState) {
      console.debug("Setting I/O", io, "to", state);
      await uioState.updateIoState(io, state);
    }
  }
  let gridSize = size === "lg" ? 3 : size === "md" ? 6 : 12;
  if (isSmall) {
    gridSize = size === "lg" ? 6 : size === "md" ? 6 : 12;
  }
  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          p={0}
        >
          <Grid
            container
            spacing={0.5}
            width="100%"
            height="100%"
            m={1}
            overflow="scroll"
            flexDirection="row"
            flexWrap="wrap"
            justifyContent="center"
            alignContent="center"
            alignItems="center"
          >
            {configs.ios.map((io, idx) => {
              const state = uioState ? uioState.state[io] : 0;
              const info = dashboard.device.uio.list[io];
              return (
                <Grid xs={gridSize}
                  key={`io-${io}`}
                  display="flex"
                  padding={0}
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <IoControl
                    io={io}
                    info={info}
                    state={state}
                    onChange={(state: number) => onChange(io, state)}
                    disabled={!!pause}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </GridZStack>

      <TileCornerLabel
        subheader={configs.name}
        subheaderColor={ThemeColors.colors.secondaryColor}
      />
    </GridContainer>
  );
});

export default UioTile;
