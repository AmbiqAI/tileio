import { alpha } from "@mui/material";
import { observer } from "mobx-react-lite";
import { TileProps, TileSpec } from "./BaseTile";
import MetricPlotTile from "./MetricPlotTile";
import { ThemeColors } from "../../theme/theme";

export const SparklineTileSpec: TileSpec = {
  type: "SPARKLINE_TILE",
  name: "Sparkline Tile",
  description: "Display a sparkline of a metric",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'metric', 'color'],
    properties: {
      name: {
        type: 'string',
        default: 'Sparkline'
      },
      slot: {
        type: 'integer',
        "enum": [0, 1, 2, 3],
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
  primaryColor: string;
  secondaryColor: string;
  min: number;
  max: number;
}

const SparklineTile = observer(({ slots, duration, config }: TileProps) => {
  const configs = config as SparklineTileConfig;
  const name = configs.name;
  const slotIdx = configs.slot;
  const metric = configs.metric;
  const slot = slots[slotIdx];
  const data = slot.metrics.data.map((d) => ({ ts: d[0], y: d[metric+1] }));
  return (
    <MetricPlotTile
      name={name}
      latestTs={slot.metrics.latestTs}
      data={data}
      primaryColor={alpha(configs.primaryColor, 0.6)}
      secondaryColor={configs.secondaryColor}
      min={configs.min}
      max={configs.max}
      duration={duration}
    />
  );
});
export default SparklineTile;
