import { Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import IoControl from "../IoControl";
import { useMemo } from "react";
import TileCornerLabel from "./TileCornerLabel";
import { ThemeColors } from "../../theme/theme";

export const IoTileSpec: TileSpec = {
  type: "IO_TILE",
  name: "IO Tile",
  description: "Display user I/O",
  sizes: ["sm", "md"],
  schema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        description: "Label",
      },
      io: {
        type: "number",
        minimum: 0,
        maximum: 7,
        default: 0,
        description: "I/O Number",
      }
    }
  }
};

export interface IoTileConfig {
  name?: string;
  io: number;

}

export function parseConfig(config: { [key: string]: any }): IoTileConfig {
  const configs = {
    name: "",
    io: 0,
    ...config
  } as IoTileConfig;
  return configs;
}


const UioTile = observer(({ config, uioState, dashboard, pause }: TileProps) => {

  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const info = dashboard.device.uio.list[configs.io] || null;
  const state = uioState ? uioState.state[configs.io] : 0;
  const onChange = async (state: number) => {
    if (uioState) {
      console.log("Setting I/O", configs.io, "to", state);
      await uioState.updateIoState(configs.io, state);
    }
  }
  return (
    <GridContainer>

      <GridZStack level={1}>
        <Stack
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="flex-start"
          padding={0}
          sx={{
            pt: 1.2,
          }}
        >
          <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1 }}>
            {configs.name}
          </Typography>
        </Stack>
      </GridZStack>

      <GridZStack level={2}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          p={1}
        >
          <IoControl
            io={configs.io}
            info={info}
            state={state}
            onChange={onChange}
            disabled={!!pause}
          />
        </Stack>
      </GridZStack>
      <TileCornerLabel
        subheader={"I/O"}
        subheaderColor={ThemeColors.colors.secondaryColor}
      />

    </GridContainer>
  );
});

export default UioTile;
