import { observer } from "mobx-react-lite";
import { TileProps } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { Box, Stack } from "@mui/material";
import Markdown from 'react-markdown';
import { TileSpec } from "./BaseTile";

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
        default: 'Sparkline',
        description: 'Name',
      },
      markdown: {
        type: 'string',
        default: '',
        description: 'Markdown content'
      }
    }
  },
  uischema: {
    "markdown": {
      "ui:widget": "textarea"
    },
  }
};

const MarkdownTile = ({ config }: TileProps) => {
  const configs = config as { name: string; markdown: string; };
  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack height="100%" width="100%" justifyContent="center" alignItems="center">
          <Box
            mx={2}
            my={1}
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
