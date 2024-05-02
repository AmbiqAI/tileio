import { Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { useMemo } from "react";
import { ThemeColors } from "../../theme/theme";

export const MetricTextTileSpec: TileSpec = {
  type: "METRIC_TEXT_TILE",
  name: "Metric Text",
  description: "Display metric text",
  streamingRequired: false,
  sizes: ["sm", "md"],
  schema: {
    type: "object",
    required: ["name", "slot", "metric", "values", "placeholder"],
    properties: {
      name: {
        type: "string",
        description: "Metric Text",
      },
      slot: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        description: 'Slot',
      },
      metric: {
        type: 'integer',
        minimum: 0,
        maximum: 60,
        default: 0,
        description: 'Metric',
      },
      values: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: [],
        description: 'Values',
      },
      placeholder: {
        type: 'string',
        default: '',
        description: 'Placeholder',
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
    }
  },
  uischema: {
    "slot": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "metric": {
    },
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    }
  }
};

export interface MetricTextTileConfig {
  name: string;
  slot: number;
  metric: number;
  values: string[];
  placeholder: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function parseConfig(config: { [key: string]: any }): MetricTextTileConfig {
  const configs = {
    name: "Metric Text",
    slot: 0,
    metric: 0,
    values: [],
    placeholder: "",
    ...config
  } as MetricTextTileConfig;
  return configs;
}


const MetricTextTile = observer(({ slots, config }: TileProps) => {

  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const metrics = configs.slot < slots.length ? slots[configs.slot].metrics : undefined;
  const latestTs = metrics ? metrics.latestTs : 0;
  let data = metrics && metrics.data.length ? metrics.data[metrics.data.length - 1] : [];
  const value = configs.metric+1 < data.length ? Math.round(data[configs.metric+1]) : 0;
  const text = value < configs.values.length ? configs.values[value] : configs.placeholder;

  return (
    <GridContainer>

      <GridZStack level={2}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          p={1}
        >
          <Typography color={configs.primaryColor ?? ThemeColors.colors.primaryColor} variant="h4" sx={{ lineHeight: 1 }}>
            {text}
          </Typography>
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
          <Typography color={configs.secondaryColor ?? ThemeColors.colors.secondaryColor} fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
          {configs.name}
          </Typography>
        </Stack>
      </GridZStack>

    </GridContainer>
  );
});

export default MetricTextTile;
