import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps, TileSpec } from "./BaseTile";
import { binarySearch, GridContainer, GridZStack } from "./utils";
import { alpha, useTheme } from "@mui/material";
import { getPlotDurationMs } from "../constants";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";

export const StreamPlotTileSpec: TileSpec =   {
  type: "STREAM_PLOT_TILE",
  name: "Signal Stream Plot",
  description: "Stream signal data",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'chs', 'fiducial', 'primaryColor', 'secondaryColor', 'streamDelay', 'fps'],
    properties: {
      name: {
        type: 'string',
        default: 'Stream Plot'
      },
      slot: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        title: 'Slot',
      },
      chs: {
        type: 'array',
        "title": "Channels",
        minItems: 1,
        maxItems: 4,
        items: {
          "type": "integer",
          "enum": [ 0, 1, 2, 3 ]
        },
        uniqueItems: true
      },
      fiducial: {
        type: 'integer',
        title: 'Fiducial Mask',
        default: 0
      },
      primaryColor: {
        type: 'string',
        title: 'Primary Color',
        default: ThemeColors.colors.primaryColor
      },
      secondaryColor: {
        type: 'string',
        title: 'Secondary Color',
        default: ThemeColors.colors.secondaryColor
      },
      tertiaryColor: {
        type: 'string',
        title: 'Tertiary Color',
        default: ThemeColors.colors.tertiaryColor
      },
      quaternaryColor: {
        type: 'string',
        title: 'Quaternary Color',
        default: ThemeColors.colors.quaternaryColor
      },
      streamDelay: {
        type: 'number',
        title: 'Stream Delay',
        default: 500,
        minimum: -2000,
        maximum: 2000,
        description: 'Stream delay (ms)'
      },
      streamGap: {
        type: 'number',
        title: 'Stream Gap',
        default: 500,
        minimum: 0,
        maximum: 1000,
        description: 'Stream gap (ms)'
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
    "chs": {
      "ui:widget": "checkboxes",
      "ui:options": {
        "inline": true
      }
    },
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    },
    "tertiaryColor": {
      "ui:widget": "color"
    },
    "quaternaryColor": {
      "ui:widget": "color"
    }
  }
};

function parseConfig(config: { [key: string]: any}) {
  const configs = {
    name: 'Stream',
    slot: 0,
    chs: [0],
    fiducial: 0,
    primaryColor: ThemeColors.colors.primaryColor,
    secondaryColor: ThemeColors.colors.secondaryColor,
    tertiaryColor: ThemeColors.colors.tertiaryColor,
    quaternaryColor: ThemeColors.colors.quaternaryColor,
    streamDelay: 500,
    streamGap: 500,
    fps: 15,
    ...config
  } as StreamPlotTileConfig;
  return configs;
}

export interface StreamPlotTileConfig {
  name: string;
  slot: number;
  chs: number[];
  fiducial: number;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  quaternaryColor: string;
  streamDelay: number;
  streamGap: number;
  fps: number;
}


const StreamPlotTile = observer(({ size, slots, pause, duration, config, dashboard }: TileProps) => {
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
      spanGaps: configs.streamGap,
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
          common: {
            drawTime: 'beforeDatasetsDraw',
          },
          animations: {duration: 0},
          annotations: []
        },
        tooltip: { enabled: false },
        legend: {
          display: true, // configs.chs.length > 1,
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
    }
  }, [pause, configs, theme, duration, size]);

  const data = useMemo<ChartData<"line">>(() => {
    const chNames = configs.chs.map(ch => configs.slot < dashboard.device.slots.length && ch < dashboard.device.slots[configs.slot].chs.length ? dashboard.device.slots[configs.slot].chs[ch] : `CH${ch}`);
    const colors = [configs.primaryColor, configs.secondaryColor, configs.tertiaryColor, configs.quaternaryColor];
    return {
      datasets: chNames.map((ch, i) => ({
          label: ch,
          backgroundColor: alpha(colors[i%colors.length], 0.3),
          borderColor: colors[i%colors.length],
          yAxisID: "y",
          data: [],
      })),
    };
  }, [configs, dashboard.device.slots]);

  useEffect(() => {
    const chart = chartEl.current;
    const signals = configs.slot < slots.length ? slots[configs.slot].signals : undefined;
    const mask = configs.slot < slots.length ? slots[configs.slot].mask : undefined;
    if (pause || !chart || !signals || !mask || !signals.data || !signals.data.length) {
      return;
    }
    for (let i = 0; i < configs.chs.length; i++) {
      const ch = configs.chs[i];
      const dataset = chart.data.datasets[i];
      if (!dataset || signals.data[0].length < ch) { continue; }
      const sigData = dataset.data as { x: number; y: number }[];
      const refTs = sigData.length ? sigData[sigData.length - 1].x : 0;
      const newIdx = binarySearch(signals.data, refTs, (a, b) => a - b[0]);
      if (newIdx >= signals.data.length) { continue; }
      for (let j = newIdx; j < signals.data.length; j++) {
        sigData.push({ x: signals.data[j][0], y: signals.data[j][ch+1] });
      }
    }

    const annotation = chart.options.plugins?.annotation;
    if (!data || !annotation) {
      return;
    }
    annotation.annotations = mask.fiducials.filter(f => f.value === configs.fiducial).map((fid) => ({
      type: 'line',
      drawTime: 'afterDatasetsDraw',
      borderColor: configs.secondaryColor,
      borderDash: [5, 3],
      borderWidth: 2,
      scaleID: 'x',
      value: fid.ts,
    }));

    chart.update("quiet");
  }, [latestTs, configs, pause, data, slots]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ margin: "4px 0px 4px 0px" }}>
        <Line ref={chartEl} data={data} options={options} />
      </GridZStack>
    </GridContainer>
  );
});

export default StreamPlotTile;
