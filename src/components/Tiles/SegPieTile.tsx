import { Doughnut } from "react-chartjs-2";
import { useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions, LegendItem } from "chart.js";
import { Stack, Typography, useTheme } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { observer } from "mobx-react-lite";
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
    required: ['name', 'slot', 'units', 'segments'],
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
              type: 'number',
              default: 0
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
  segments: {name: string, value: number, color: string}[];
}

export function parseConfig(config: { [key: string]: any }): SegPieTileConfig {
  const configs = {
    name: 'Segmentation',
    units: 'Percent',
    slot: 0,
    segments: [],
    ...config
  } as SegPieTileConfig;
  return configs;
}


const SegPieTile = observer(({ slots, config }: TileProps) => {

  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const theme = useTheme();
  const segmentAmounts = configs.slot < slots.length ? slots[configs.slot].mask.segmentAmounts : {};
  const names = configs.segments.map((segment) => segment.name);
  const colors = configs.segments.map((segment) => segment.color || ThemeColors.colors.primaryColor);
  const data = configs.segments.map((segment) => segmentAmounts[segment.value] || 1e-9);
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  const labels: LegendItem[] = configs.segments.map((segment, i) => ({
    text: `${segment.name}: ${(100*data[i]/total).toFixed(0)}%`,
    fillStyle: segment.color || ThemeColors.colors.primaryColor,
  }));
  const latestTs = configs.slot < slots.length ? slots[configs.slot].mask.latestTs : 0;

  const chartEl = useRef<Chart<"doughnut">>(null);
  const chartData = useMemo<ChartData<"doughnut">>(
    () => ({
      labels: names,
      datasets: [
        {
          label: "DS1",
          data: data,
          backgroundColor: colors,
        },
      ],
    }),
    [latestTs]
  );

  const options = useMemo<ChartOptions<"doughnut">>(() => ({
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
            font: {
              size: 14,
              weight: "bold",
            },
            generateLabels: (chart: Chart): LegendItem[] => {
              return labels;
            },
            color: theme.palette.text.primary
          }
        },
      },
    }),
  [latestTs]);

  // useEffect(() => {
  //   const chart = chartEl.current;
  //   if (!chart) {
  //     return;
  //   }
  //   chart.data.datasets = [
  //     {
  //       label: name,
  //       backgroundColor: createGradient(
  //         chart.ctx,
  //         chart.chartArea,
  //         primaryColor
  //       ),
  //       borderColor: alpha(primaryColor, 0.6),
  //       fill: "start",
  //       tension: 0.4,
  //       data: [],
  //     },
  //   ];
  //   chart.update("none");
  //   return;
  // }, [name, primaryColor]);

  // useEffect(() => {
  //   const chart = chartEl.current;
  //   if (!chart || !data.length) {
  //     return;
  //   }
  //   // @ts-ignore
  //   chart.data.datasets[0].data = data;
  //   if (duration) {
  //     chart.options.scales!.x!.max = Date.now();
  //     chart.options.scales!.x!.min = Date.now() - duration*1000;
  //   }
  //   chart.update("none");
  // }, [data, latestTs]);

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
            // style={{ margin: "0px -2px -8px -2px" }}
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
