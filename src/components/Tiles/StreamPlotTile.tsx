import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps, TileSpec } from "./BaseTile";
import { binarySearch, GridContainer, GridZStack } from "./utils";
import { alpha, useTheme } from "@mui/material";
import { pkStreamPlotDelayMs, pkPlotGapSizeMs, getPlotDurationMs, pkStreamFPS } from "../constants";
import { observer } from "mobx-react-lite";
import { ThemeColors } from "../../theme/theme";

export const StreamPlotTileSpec: TileSpec =   {
  type: "STREAM_PLOT_TILE",
  name: "Stream Plot",
  description: "Stream signal data",
  streamingRequired: true,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'fiducial', 'primaryColor', 'secondaryColor'],
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
      ch: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 3
      },
      fiducial: {
        type: 'integer',
        description: 'Fiducial mask',
        default: 0
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

export interface StreamPlotTileConfig {
  name: string;
  slot: number;
  ch: number;
  fiducial: number;
  primaryColor: string;
  secondaryColor: string;
}

const StreamPlotTile = observer(({ size, slots, pause, duration, config }: TileProps) => {
  const theme = useTheme();
  const configs = config as StreamPlotTileConfig;
  const slotIdx = configs.slot && configs.slot < slots.length ? configs.slot : 0;
  const fiducialMask = configs.fiducial;
  const signals = slots[slotIdx].signals;
  const mask = slots[slotIdx].mask;

  const showAxis = size === "lg";
  const durationMs = getPlotDurationMs(duration, size);
  const chartEl = useRef<Chart<"line">>(null);

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cubicInterpolationMode: "monotone",
      spanGaps: pkPlotGapSizeMs,
      elements: {
        point: { radius: 1 },
      },
      animation: false,
      transitions: {
        show: { animation: { duration: 0 } },
        hide: { animation: { duration: 0 } },
      },
      plugins: {
        annotation: {
          // @ts-ignore
          annotations: []
        },
        tooltip: { enabled: false },
        legend: {
          display: false,
          fullSize: true,
          position: "top",
          align: "end",
          labels: {
            font: { size: 14, weight: "bold" },
          },
        },
      },
      scales: {
        y: {
          display: true,
          ticks: { display: false },
          position: "left",
          title: {
            display: true,
            text: configs.name || '',
            color: theme.palette.text.disabled
          },
          grid: {
            display: true,
            borderColor: theme.palette.text.primary,
            borderWidth: 2,
            color: theme.palette.divider
          },
          reverse: false,
        },
        x: {
          type: "realtime",
          display: true,
          ticks: { display: showAxis},
          title: {
            color: theme.palette.text.disabled
          },
          grid: {
            display: true,
            borderColor: theme.palette.text.primary,
            borderWidth: 2,
            color: theme.palette.divider
          },
          realtime: {
            duration: durationMs,
            delay: pkStreamPlotDelayMs,
            frameRate: pkStreamFPS,
            pause: pause,
          },
        },
      },
    }),
    [showAxis, durationMs, pause]
  );

  const data = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: '',
          backgroundColor: alpha(configs.primaryColor, 0.3),
          borderColor: configs.primaryColor,
          yAxisID: "y",
          data: [],
        }
      ],
    }),
    [configs.primaryColor]
  );

  useEffect(() => {
    const chart = chartEl.current;
    if (pause || !chart || !signals || !mask) {
      return;
    }
    const data = chart.data.datasets[0].data;
    const annotation = chart.options.plugins?.annotation;
    if (!data || !annotation) {
      return;
    }

    const sigData = chart.data.datasets[0].data as { x: number; y: number }[];
    const refTs = sigData.length ? sigData[sigData.length - 1].x : 0;
    const newIdx = binarySearch(signals.data, refTs, (a, b) => a - b[0]);
    if (newIdx >= signals.data.length) { return; }
    for (let i = newIdx; i < signals.data.length; i++) {
      sigData.push({ x: signals.data[i][0], y: signals.data[i][configs.ch+1] });
    }

    annotation.annotations = mask.fiducials.filter(f => f.value & fiducialMask).map((fid) => ({
      type: 'line',
      drawTime: 'afterDatasetsDraw',
      borderColor: configs.secondaryColor,
      borderDash: [5, 3],
      borderWidth: 2,
      scaleID: 'x',
      value: fid.ts,
    }));

    chart.update("none");
  }, [signals, signals.latestTs, mask, pause]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ margin: "4px 0px 4px 0px" }}>
        <Line ref={chartEl} data={data} options={options} />
      </GridZStack>
    </GridContainer>
  );
});

export default StreamPlotTile;
