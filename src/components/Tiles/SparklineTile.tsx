import { alpha } from "@mui/material";
import { observer } from "mobx-react-lite";
import { TileProps, TileSpec } from "./BaseTile";
import MetricPlotTile from "./MetricPlotTile";
import { ThemeColors } from "../../theme/theme";
import { useMemo } from "react";

export const SparklineTileSpec: TileSpec = {
  type: "SPARKLINE_TILE",
  name: "Sparkline Tile",
  description: "Display a sparkline of a metric",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'metric', 'units', 'color'],
    properties: {
      name: {
        type: 'string',
        default: 'Sparkline'
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
      units: {
        type: 'string',
        default: '',
        description: 'Units',
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
      min: {
        type: 'number'
      },
      max: {
        type: 'number'
      }
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
    "units": {
    },
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    }
  }
};

export interface SparklineTileConfig {
  name: string;
  slot: number;
  metric: number;
  units: string;
  primaryColor: string;
  secondaryColor: string;
  min: number;
  max: number;
}

export function parseConfig(config: { [key: string]: any }): SparklineTileConfig {
  const configs = {
    name: 'Sparkline',
    slot: 0,
    metric: 0,
    units: '',
    ...config
  } as SparklineTileConfig;
  return configs;
}

const SparklineTile = observer(({ slots, duration, config }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  console.log('iddqd', configs.name, configs.slot, slots.length);
  const name = configs.name;
  const metric = configs.metric;
  const units = configs.units;
  const metrics = configs.slot < slots.length ? slots[configs.slot].metrics : undefined;
  const latestTs = metrics ? metrics.latestTs : 0;
  const data = metrics ? metrics.data.map((d) => ({ ts: d[0], y: d[metric+1] })) : [];

  return (
    <MetricPlotTile
      name={name}
      latestTs={latestTs}
      data={data}
      units={units}
      primaryColor={alpha(configs.primaryColor, 0.6)}
      secondaryColor={configs.secondaryColor}
      min={configs.min}
      max={configs.max}
      duration={duration}
    />
  );
});
export default SparklineTile;
