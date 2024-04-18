import { Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import IoControl from "../IoControl";
import { delay } from "../../utils";
import { useMemo } from "react";

export const IoTileSpec: TileSpec = {
  type: "IO_TILE",
  name: "IO Tile",
  description: "Display user I/O",
  streamingRequired: false,
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


const UioTile = observer(({ config, uioState, device, pause }: TileProps) => {

  const configs = useMemo(() => parseConfig(config || {}), [config]);

  const info = device.uio.list[configs.io] || null;
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
            hideLabel
          />
        </Stack>
      </GridZStack>

      <GridZStack level={1} style={{pointerEvents: "none"}}>
        <Stack
          width="100%"
          height="100%"
          alignItems="flex-end"
          justifyContent="flex-end"
          padding={0}
          sx={{
            userSelect: "none",
            WebkitUserSelect: "none",
            textAlign: "end",
            pr: 0.5,
            pb: 0.5,
          }}
        >
          <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
            I/O
          </Typography>
        </Stack>
      </GridZStack>

    </GridContainer>
  );
});

export default UioTile;