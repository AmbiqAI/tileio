// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { Box, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { useMemo } from "react";
import IoControl from "../IoControl";
import { ThemeColors } from "../../theme/theme";

export const UioTileSpec: TileSpec = {
  type: "UIO_TILE",
  name: "UIO Tile",
  description: "Control user I/O",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: "object",
    required: ["name", "ios", "primaryColor", "secondaryColor"],
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
      primaryColor: {
        type: 'string',
        default: ThemeColors.colors.primaryColor,
        description: 'Primary color',
      },
      secondaryColor: {
        type: 'string',
        default: ThemeColors.colors.secondaryColor,
        description: 'Secondary color',
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
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    },
  }
};

export interface UioTileConfig {
  name: string;
  ios: number[];
  primaryColor: string;
  secondaryColor: string;
}

export function parseConfig(config: { [key: string]: any }): UioTileConfig {
  const configs = {
    name: "",
    ios: [],
    primaryColor: ThemeColors.colors.primaryColor,
    secondaryColor: ThemeColors.colors.secondaryColor,
    ...config,
  } as UioTileConfig;
  return configs;
}

const UioTile = observer(({ config, uioState, dashboard, pause, size }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const onChange = async (io: number, state: number) => {
    if (uioState) {
      console.debug("Setting I/O", io, "to", state);
      await uioState.updateIoState(io, state);
    }
  }
  return (
    <Stack sx={{ height: '100%', boxSizing: 'border-box', p: 1.5, gap: 1,
      containerType: 'inline-size' }}>
      {configs.name && <Typography sx={{ fontSize: 12, fontWeight: 500,
        lineHeight: '16px', color: 'text.primary' }}>{configs.name}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: size === 'lg'
        ? 'repeat(4, minmax(0, 1fr))' : size === 'md' ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        '@container (max-width: 400px)': { gridTemplateColumns: size === 'sm' ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))' },
        gap: 1.25, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', alignContent: 'start' }}>
            {configs.ios.map((io, idx) => {
              const state = uioState ? uioState.state[io] : 0;
              const info = dashboard.device.uio.list[io];
              return (
                <Box
                  key={`io-${io}`}
                  sx={{ minWidth: 0 }}
                >
                  <IoControl
                    compact
                    io={io}
                    info={info}
                    state={state}
                    onChange={(state: number) => onChange(io, state)}
                    disabled={!!pause || !uioState?.hydrated}
                  />
                </Box>
              );
            })}
      </Box>
    </Stack>
  );
});

export default UioTile;
