import { observer } from "mobx-react-lite";
import { TileProps } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { Box, Stack } from "@mui/material";
import Markdown from 'react-markdown';
import { TileSpec } from "./BaseTile";
import { useMemo } from "react";

export const MarkdownTileSpec: TileSpec = {
  type: "MARKDOWN_TILE",
  name: "Markdown Tile",
  description: "Render markdown",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'markdown'],
    properties: {
      name: {
        type: 'string',
        default: 'Markdown',
        title: 'Name',
      },
      markdown: {
        type: 'string',
        default: '',
        title: 'Markdown content'
      }
    }
  },
  uischema: {
    "markdown": {
      "ui:widget": "textarea"
    },
  }
};

export interface MarkdownTileConfig {
  name: string;
  markdown: string;
}

export function parseConfig(config: { [key: string]: any }): MarkdownTileConfig {
  const configs = {
    name: 'Markdown',
    markdown: '',
    ...config
  } as MarkdownTileConfig;
  return configs;
}


const MarkdownTile = ({ config }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);

  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack height="100%" width="100%" justifyContent="center" alignItems="center">
          <Box
            px={1}
            pt={-2}
            m={0}
            height="100%"
            width="100%"
            sx={{
              overflowY: "scroll"
            }}
          >
            <Markdown>{configs.markdown || ''}</Markdown>
          </Box>
        </Stack>
      </GridZStack>
      </GridContainer>
  );
};

export default observer(MarkdownTile);
