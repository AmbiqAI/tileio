// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import MetricPlotTile from "./MetricPlotTile";
import { ThemeColors } from "../../theme/theme";
import { useMemo } from "react";

export const SparklineTileSpec: TileSpec = {
  type: "SPARKLINE_TILE",
  name: "Sparkline Tile",
  description: "Display a sparkline of a metric",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'metric', 'units'],
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
      precision: {
        type: 'integer',
        default: 0,
        minimum: 0,
        maximum: 2,
        description: 'Decimal places'
      },
      transform: {
        type: 'string',
        enum: ['identity', 'ips_per_watt_to_uj'],
        enumNames: ['None', 'IPS/W to µJ/inf'],
        default: 'identity',
        title: 'Value conversion',
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
  precision?: number;
  transform?: 'identity' | 'ips_per_watt_to_uj';
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
    precision: 0,
    ...config
  } as SparklineTileConfig;
  return configs;
}

const SparklineTile = observer(({ slots, duration, config }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const metrics = configs.slot < slots.length ? slots[configs.slot].metrics : undefined;
  const latestTs = metrics ? metrics.latestTs : 0;
  const data = metrics ? metrics.data.map((d) => ({ ts: d[0], y: transformMetric(d[configs.metric+1], configs.transform) })) : [];
  return (
    <MetricPlotTile
      name={configs.name}
      latestTs={latestTs}
      data={data}
      units={configs.units}
      primaryColor={configs.primaryColor}
      secondaryColor={configs.secondaryColor}
      min={configs.min}
      max={configs.max}
      precision={configs.precision}
      duration={duration}
    />
  );
});
export default SparklineTile;

export function transformMetric(value: number, transform?: SparklineTileConfig['transform']): number {
  if (transform === 'ips_per_watt_to_uj') {
    return Number.isFinite(value) && value > 0 ? 1e6 / value : NaN;
  }
  return value;
}
