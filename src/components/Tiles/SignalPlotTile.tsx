import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps, TileSpec } from "./BaseTile";
import { binarySearch, GridContainer, GridZStack } from "./utils";
import { alpha, useTheme } from "@mui/material";
import { getPlotDurationMs } from "../constants";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";

export const SignalPlotTileSpec: TileSpec =   {
  type: "SIGNAL_PLOT_TILE",
  name: "Simple Signal Plot",
  description: "Signal plot",
  streamingRequired: true,
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
        "items": {
          "type": "integer",
          "enum": [ 0, 1, 2, 3 ]
        },
        "uniqueItems": true
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
    fps: 15,
    ...config
  } as SignalPlotTileConfig;
  return configs;
}

export interface SignalPlotTileConfig {
  name: string;
  slot: number;
  chs: number[];
  fiducial: number;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  quaternaryColor: string;
  streamDelay: number;
  fps: number;
}


const SignalPlotTile = observer(({ size, slots, pause, duration, config, device }: TileProps) => {
  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const latestTs = configs.slot < slots.length ? slots[configs.slot].signals.latestTs : 0;
  const chartEl = useRef<Chart<"line">>(null);

  const options = useMemo<ChartOptions<"line">>(() => {
    const showAxis = false;
    const durationMs = getPlotDurationMs(duration, size);

    return {
      responsive: true,
      maintainAspectRatio: false,
      cubicInterpolationMode: "monotone",
      spanGaps: 2*configs.streamDelay,
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
          type: "linear",
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
        },
      },
    }
  }, [pause, configs, theme, duration, size]);

  const data = useMemo<ChartData<"line">>(() => {
    const chNames = configs.chs.map(ch => configs.slot < device.slots.length && ch < device.slots[configs.slot].chs.length ? device.slots[configs.slot].chs[ch] : `CH${ch}`);
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
  }, [configs, device.slots]);

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
      dataset.data = signals.data.map((d, i) => ({ x: i, y: d[ch+1] }));
    }

    // const annotation = chart.options.plugins?.annotation;
    // if (!data || !annotation) {
    //   return;
    // }
    // annotation.annotations = mask.fiducials.filter(f => f.value === configs.fiducial).map((fid) => ({
    //   type: 'line',
    //   drawTime: 'afterDatasetsDraw',
    //   borderColor: configs.secondaryColor,
    //   borderDash: [5, 3],
    //   borderWidth: 2,
    //   scaleID: 'x',
    //   value: fid.ts,
    // }));

    chart.update("default");
  }, [latestTs, configs, pause, data, slots]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ margin: "4px 0px 4px 0px" }}>
        <Line ref={chartEl} data={data} options={options} />
      </GridZStack>
    </GridContainer>
  );
});

export default SignalPlotTile;
