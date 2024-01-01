import { Scatter } from "react-chartjs-2";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions, ScriptableContext } from "chart.js";
import { alpha, useTheme } from "@mui/system";
import { TileProps, TileSpec } from "./BaseTile";
import { Stack, Typography } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { ThemeColors } from "../../theme/theme";
import { observer } from "mobx-react-lite";

function getFillColor(color: string): ((context: ScriptableContext<"line">) => string) {
  const fn = (context: ScriptableContext<"line">) => {
    const alphaLevel = Math.max(Math.min(context.dataIndex/context.dataset.data.length, 0.9), 0.1);
    return alpha(color, alphaLevel);
  };
  return fn;
}

export const PoincarePlotSpec: TileSpec = {
  type: "POINCARE_PLOT",
  name: "Poincare Tile",
  description: "Poincare of fiducials",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'primaryColor', 'fiducial'],
    properties: {
      name: {
        type: 'string',
        default: 'Poincare'
      },
      slot: {
        type: 'number',
        minimum: 0,
        maximum: 3,
        default: 0,
        description: 'Slot',
      },
      fiducial: {
        type: 'integer',
        description: 'Fiducial mask',
        minimum: 0,
        maximum: 15,
        default: 0
      },
      primaryColor: {
        type: 'string',
        description: "Primary color",
        default: ThemeColors.colors.primaryColor,
      },
      min: {
        type: 'number',
        description: 'Minimum value',
      },
      max: {
        type: 'number',
        description: 'Maximum value',
      }
    }
  },
  uischema: {
    "primaryColor": {
      "ui:widget": "color"
    },
  }
};

export interface PoincarePlotConfig {
  name: string;
  slot: number;
  fiducial: number;
  primaryColor: string;
  min?: number;
  max?: number;
}

const PoincarePlot = observer(({ slots, pause, config }: TileProps) => {
  const theme = useTheme();
  const configs = config as PoincarePlotConfig;
  const slotIdx = configs.slot && configs.slot < slots.length ? configs.slot : 0;
  const fiducialMask = configs.fiducial;
  const slot = slots[slotIdx];
  const mask = slot.mask;

  const gridColor = useMemo(() => alpha(ThemeColors.colors.primaryColor, 0.7), []);

  const chartEl = useRef<Chart<"scatter">>(null);

  const data = useMemo<ChartData<"scatter">>(
    () => ({
      datasets: [
        {
          label: "DATA",
          borderWidth: 0,
          radius: 6,
          backgroundColor: getFillColor(configs.primaryColor),
          borderColor: getFillColor(configs.primaryColor),
          fill: false,
          data: [],
        },
      ],
    }),
    []
  );

  const options = useMemo<ChartOptions<"scatter">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: false,
      animation: { duration: 0 },
      elements: { point: { radius: 1 } },
      transitions: {
        show: { animations: {} },
        hide: { animation: { duration: 0 } },
      },
      plugins: {
        annotation: {
          annotations: [{
            type: 'line',
            drawTime: 'afterDatasetsDraw',
            borderColor: gridColor,
            borderWidth: 2,
          }],
        },
        tooltip: { enabled: false },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: true,
          min: configs.min,
          max: configs.max,
          grid: {
            display: true,
            borderColor: theme.palette.text.primary,
            borderWidth: 2,
            color: theme.palette.divider
          },
          title: {
            display: true,
            text: configs.name || undefined,
            color: theme.palette.text.disabled,
          },
          position: "top",
          ticks: { display: false, mirror: true },
        },
        x: {
          min: configs.min,
          max: configs.max,
          grid: {
            display: true,
            borderColor: theme.palette.text.primary,
            borderWidth: 2,
            color: theme.palette.divider
          },
          position: "left",
          ticks: { display: false, mirror: true },
        },
      },
    }),
    [gridColor]
  );

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart || !mask) {
      return;
    }
    const dataset = chart.data.datasets[0];
    dataset.data = [];
    const peaks = mask.fiducials.filter(f => f.value & fiducialMask);

    for (let i = 1; i < peaks.length - 1; i++) {
      dataset.data.push({ x: peaks[i].ts - peaks[i - 1].ts, y: peaks[i + 1].ts - peaks[i].ts });
    }
    chart.update("quiet");
  }, [mask.latestTs, mask, pause]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ padding: "8px" }}>
        <Scatter
          style={{ maxHeight: "400px" }}
          ref={chartEl}
          data={data}
          options={options}
        />
      </GridZStack>
      <GridZStack level={1}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="flex-end"
          alignItems="flex-end"
          padding={0}
          sx={{ textAlign: "end", pr: 0.5, pb: 0.5 }}
        >
          <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
          </Typography>
        </Stack>
      </GridZStack>
    </GridContainer>
  );
});

export default PoincarePlot;
