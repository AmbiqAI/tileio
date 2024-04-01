import { observer } from "mobx-react";
import { TileProps } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { Stack } from "@mui/material";
import SVG from 'react-inlinesvg';
import { TileSpec } from "./BaseTile";
import { useMemo } from "react";

export const SvgTileSpec: TileSpec = {
  type: "SVG_TILE",
  name: "SVG Tile",
  description: "Render svg content",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'content'],
    properties: {
      name: {
        type: 'string',
        default: 'SVG',
        title: 'Name',
      },
      content: {
        type: 'string',
        default: '',
        title: 'svg content'
      }
    }
  },
  uischema: {
    "content": {
      "ui:widget": "textarea"
    },
  }
};

export interface SvgTileConfig {
  name: string;
  content: string;
}

export function parseConfig(config: { [key: string]: any }): SvgTileConfig {
  const configs = {
    name: 'SVG',
    content: '',
    ...config
  } as SvgTileConfig;
  return configs;
}


const SvgTile = ({ config }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);

  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack height="100%" width="100%" p={1} justifyContent="center" alignItems="center">
          {/* @ts-ignore */}
          <SVG
            src={configs.content}
            width="100%"
            title={configs.name}
          />
        </Stack>
      </GridZStack>
      </GridContainer>
  );
};

export default observer(SvgTile);
