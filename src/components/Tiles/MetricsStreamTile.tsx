import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps, TileSpec } from "./BaseTile";
import { binarySearch, GridContainer, GridZStack } from "./utils";
import { ThemeColors } from "../../theme/theme";
import { getPlotDurationMs } from "../constants";
import { alpha, useTheme } from "@mui/material";
import { observer } from "mobx-react";

export const MetricsStreamTileSpec: TileSpec =   {
  type: "METRICS_STREAM_TILE",
  name: "Metrics Stream Tile",
  description: "Stream metrics data",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'metrics', 'fiducial', 'primaryColor', 'secondaryColor', 'streamDelay', 'fps'],
    properties: {
      name: {
        type: 'string',
        default: 'Stream Plot'
      },
      slot: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        description: 'Slot',
      },
      metrics: {
        type: 'array',
        title: "Metrics",
        items: {
          type: 'integer',
          minimum: 0,
          maximum: 60,
        },
        default: [0],
        minItems: 1,
        maxItems: 4,
        "uniqueItems": true
      },
      fiducial: {
        type: 'integer',
        title: 'Fiducial Mask',
        default: 0xFF,
        minimum: 0,
        maximum: 0xFF,
      },
      primaryColor: {
        type: 'string',
        default: ThemeColors.colors.primaryColor
      },
      secondaryColor: {
        type: 'string',
        default: ThemeColors.colors.secondaryColor
      },
      streamDelay: {
        type: 'number',
        title: 'Stream Delay',
        default: 500,
        minimum: 0,
        maximum: 2000,
        description: 'Stream delay (ms)'
      },
      fps: {
        type: 'number',
        title: 'FPS',
        default: 15,
        minimum: 5,
        maximum: 30,
        description: 'Frames per second'
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
    "metrics": {
    },
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    }
  }
};

function parseConfig(config: { [key: string]: any}) {
  const configs = {
    name: 'Stream',
    slot: 0,
    metrics: [0],
    fiducial: 0,
    primaryColor: ThemeColors.colors.primaryColor,
    secondaryColor: ThemeColors.colors.secondaryColor,
    streamDelay: 500,
    fps: 15,
    ...config
  } as MetricsStreamTileConfig;
  return configs;
}

export interface MetricsStreamTileConfig {
  name: string;
  slot: number;
  metrics: number[];
  fiducial: number;
  primaryColor: string;
  secondaryColor: string;
  streamDelay: number;
  fps: number;
}

const MetricsStreamTile = observer(({ size, slots, pause, duration, config }: TileProps) => {
  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const latestTs = configs.slot < slots.length ? slots[configs.slot].signals.latestTs : 0;

  const chartEl = useRef<Chart<"line">>(null);

  const options = useMemo<ChartOptions<"line">>(() => {
    const showAxis = size === "lg";
    const durationMs = getPlotDurationMs(duration, size);
    return {
      responsive: true,
      maintainAspectRatio: false,
      cubicInterpolationMode: "monotone",
      spanGaps: 4*configs.streamDelay,
      elements: {
        point: { radius: 1 },
      },
      animation: false,
      transitions: {
        show: { animation: { duration: 0 } },
        hide: { animation: { duration: 0 } },
      },
      interaction: {
        mode: "x",
      },
      plugins: {
        annotation: {
          annotations: []
        },
        tooltip: { enabled: false },
        legend: {
          fullSize: true,
          position: "top",
          align: "center",
          labels: {
            color: theme.palette.text.primary,
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
            color: theme.palette.text.primary,
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
            delay: configs.streamDelay,
            frameRate: configs.fps,
            pause: pause,
          },
        },
      },
    };
  }, [pause, size, duration, theme, configs]);

  const data = useMemo<ChartData<"line">>(() => {
    const colors = ThemeColors.colors.slots;
    return {
      datasets: configs.metrics.map((met) => ({
          label: `MET${met}`,
          backgroundColor: alpha(colors[met%colors.length], 0.7),
          borderColor: colors[met%colors.length],
          yAxisID: "y",
          data: [],
      })),
      };
    }, [configs.metrics]
  );

  useEffect(() => {
    const chart = chartEl.current;
    const metrics = configs.slot < slots.length ? slots[configs.slot].metrics : undefined;
    const mask = configs.slot < slots.length ? slots[configs.slot].mask : undefined;

    if (pause || !chart || !metrics || !mask || !metrics.data || !latestTs) {
      return;
    }
    for (let ch = 0; ch < configs.metrics.length; ch++) {
      const dataset = chart.data.datasets[ch];
      if (!dataset || metrics.data[0].length < ch) { continue; }
      const sigData = dataset.data as { x: number; y: number }[];
      const refTs = sigData.length ? sigData[sigData.length - 1].x : 0;
      const newIdx = binarySearch(metrics.data, refTs, (a, b) => a - b[0]);
      if (newIdx >= metrics.data.length) { return; }
      for (let i = newIdx; i < metrics.data.length; i++) {
        sigData.push({ x: metrics.data[i][0], y: metrics.data[i][ch+1] });
      }
    }
    const annotation = chart.options.plugins?.annotation;
    if (!data || !annotation) {
      return;
    }
    annotation.annotations = mask.fiducials.filter(f => f.value & configs.fiducial).map((fid) => ({
      type: 'line',
      drawTime: 'afterDatasetsDraw',
      borderColor: configs.secondaryColor,
      borderDash: [5, 3],
      borderWidth: 2,
      scaleID: 'x',
      value: fid.ts,
    }));
    chart.update("none");
  }, [latestTs, configs, pause, data, slots]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ margin: "4px 0px 4px 0px" }}>
        <Line ref={chartEl} data={data} options={options} />
      </GridZStack>
    </GridContainer>
  );
});

export default MetricsStreamTile;
