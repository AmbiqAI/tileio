import { Doughnut } from "react-chartjs-2";
import { useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { Stack, Typography } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { observer } from "mobx-react-lite";
import { TileProps, TileSpec } from "./BaseTile";
import { ThemeColors } from "../../theme/theme";

export const SegPieTileSpec: TileSpec =   {
  type: "SEG_PIE_TILE",
  name: "Seg Pie Tile",
  description: "Segmentation Pie Tile",
  streamingRequired: true,
  sizes: ["sm", "md"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'primaryColor', 'secondaryColor'],
    properties: {
      name: {
        type: 'string',
        default: 'Stream Plot'
      },
      slot: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 3
      },
      primaryColor: {
        type: 'string',
        default: ThemeColors.colors.primaryColor
      },
      secondaryColor: {
        type: 'string',
        default: ThemeColors.colors.secondaryColor
      }
    }
  },
  uischema: {
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    }
  }
};

export interface SegPieTileConfig {
  name: string;
  slot: number;
  primaryColor: string;
  secondaryColor: string;
}


const SegPieTile = observer(({ size, slots, pause, duration, config }: TileProps) => {
  const value = "--"
  const name = "SEG"
  const colors = ["red", "blue", "green", "yellow"];
  const data = [0.50, 0.10, 0.20, 0.10];
  const configs = config as SegPieTileConfig;
  // const value = data.length ? (data[data.length - 1][yAxisId ?? "y"] || 0).toFixed(precision ?? 0) : "--";
  const chartEl = useRef<Chart<"doughnut">>(null);
  const chartData = useMemo<ChartData<"doughnut">>(
    () => ({
      labels: ["NONE", "P-WAVE", "QRS", "T-WAVE"],
      datasets: [
        {
          label: "DS1",
          data: data,
          backgroundColor: colors
        },
      ],
    }),
    []
  );

  const options = useMemo<ChartOptions<"doughnut">>(() => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: false,
      cutout: "25%",
      // animation: {
      //   duration: 0,
      // },
      plugins: {
        tooltip: { enabled: true },
        legend: { display: false },
      },
    }),
  []);

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
      <GridZStack level={2}
      >
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          sx={{
            px: 1,
            pt: 2,
            pb: 4,
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
          <Typography fontWeight={700} variant="h4" sx={{ lineHeight: 1 }}>
            {configs.name}
          </Typography>
        </Stack>
      </GridZStack>
    </GridContainer>
  );
});

export default SegPieTile;
