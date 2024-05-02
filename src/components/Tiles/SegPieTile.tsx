import { Doughnut } from "react-chartjs-2";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { Stack, Typography, useTheme } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { observer } from "mobx-react";
import { TileProps, TileSpec } from "./BaseTile";
import { ThemeColors } from "../../theme/theme";

export const SegPieTileSpec: TileSpec = {
  type: "SEG_PIE_TILE",
  name: "Seg Pie Tile",
  description: "Segmentation Pie Tile",
  streamingRequired: true,
  sizes: ["sm", "md"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'units', 'segmentMask', 'segments'],
    properties: {
      name: {
        type: 'string',
        default: 'Segments'
      },
      slot: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        title: 'Slot',
      },
      units: {
        type: 'string',
        default: 'Percent',
        title: 'Units',
      },
      segmentMask: {
        type: 'integer',
        title: 'Segment Mask',
        default: 0x3F,
        minimum: 0,
        maximum: 0x3F,
      },
      segments: {
        type: 'array',
        title: 'Segments',
        items: {
          type: 'object',
          required: ['name', 'color'],
          properties: {
            name: {
              type: 'string',
              default: 'Segment'
            },
            value: {
              type: 'integer',
              default: 0,
              minimum: 0,
              maximum: 0x3F,
            },
            color: {
              type: 'string',
              default: ThemeColors.colors.primaryColor
            }
          }
        }
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
    "segments": {
      "items": {
        "color": {
          "ui:widget": "color"
        }
      }
    }
  }
};

export interface SegPieTileConfig {
  name: string;
  units: string,
  slot: number;
  segmentMask: number;
  segments: {name: string, value: number, color: string}[];
}

export function parseConfig(config: { [key: string]: any }): SegPieTileConfig {
  const configs = {
    name: 'Segmentation',
    units: 'Percent',
    slot: 0,
    segmentMask: 0x3F,
    segments: [],
    ...config
  } as SegPieTileConfig;
  return configs;
}


const SegPieTile = observer(({ slots, config, size }: TileProps) => {

  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);

  const chartEl = useRef<Chart<"doughnut">>(null);

  const latestTs = configs.slot < slots.length ? slots[configs.slot].mask.latestTs : 0;

  const chartData = useMemo<ChartData<"doughnut">>(() => {
    const names = configs.segments.map((segment) => segment.name);
    const colors = configs.segments.map((segment) => segment.color || ThemeColors.colors.primaryColor);
    return {
      labels: names,
      datasets: [
        {
          label: "DS1",
          data: [],
          backgroundColor: colors,
        },
      ]
    };
  }, [configs]);

  const options = useMemo<ChartOptions<"doughnut">>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: false,
      cutout: "25%",
      plugins: {
        tooltip: { enabled: true },
        legend: {
          display: true,
          position: "right",
          labels: {
            boxWidth: size === "sm" ? 20 : 40,
            font: {
              size: 12,
              weight: "bold",
            },
            color: theme.palette.text.primary
          }
        },
      }
    };
    },
  [theme]);

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart || !latestTs) {
      return;
    }
    const segmentAmounts = configs.slot < slots.length ? slots[configs.slot].mask.segmentAmounts : {};
    const data = configs.segments.map((segment) => segmentAmounts[segment.value] || 1e-9);

    if (chart.legend) {
      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
      chart.legend.legendItems = configs.segments.map((segment, i) => ({
        text: `${segment.name}: ${(100*data[i]/total).toFixed(0)}%`,
        fillStyle: segment.color || ThemeColors.colors.primaryColor,
      }));
    }

    const chartData = chart.data.datasets[0];
    chartData.data = data;

    chart.update("none");
    return;
  }, [latestTs, configs, slots]);



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
            userSelect: "none",
            WebkitUserSelect: "none",
            textAlign: "end",
            pt: 1,
          }}
        >
          <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1 }}>
            {configs.name}
          </Typography>
        </Stack>
      </GridZStack>

      <GridZStack level={2}
      >
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          sx={{
            px: 1,
            pt: 5,
            pb: 2,
          }}
        >
          <Doughnut
            ref={chartEl}
            data={chartData}
            options={options}
          />
        </Stack>
      </GridZStack>
      <GridZStack level={1}>
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
            pointerEvents: "none",
            pr: 0.5,
            pb: 0.5,
          }}
        >
          <Typography color={ThemeColors.colors.secondaryColor} fontWeight={700} variant="h6" sx={{ lineHeight: 1 }}>
            {configs.units}
          </Typography>
        </Stack>
      </GridZStack>
    </GridContainer>
  );
});

export default SegPieTile;
