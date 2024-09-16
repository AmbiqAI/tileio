import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { ThemeColors } from "../../theme/theme";
import { getPlotDurationMs } from "../constants";
import { alpha, useTheme } from "@mui/material";
import { observer } from "mobx-react";

export const SegmentStreamTileSpec: TileSpec =   {
  type: "SEGMENTS_STREAM_TILE",
  name: "Segment Stream Tile",
  description: "Stream segments data",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'segments', 'streamDelay', 'fps'],
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
              type: 'number',
              default: 0
            },
            color: {
              type: 'string',
              default: ThemeColors.colors.primaryColor
            }
          }
        },
        minItems: 1,
        maxItems: 6,
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
    "segments": {
      "items": {
        "color": {
          "ui:widget": "color"
        }
      }
    }
  }
};

export interface SegmentStreamTileConfig {
  name: string;
  slot: number;
  segmentMask: number;
  segments: {name: string, value: number, color: string}[];
  streamDelay: number;
  fps: number;
}

function parseConfig(config: { [key: string]: any}) {
  const configs = {
    name: 'Stream',
    slot: 0,
    segmentMask: 0x3F,
    segments: [],
    streamDelay: 500,
    fps: 15,
    ...config
  } as SegmentStreamTileConfig;
  return configs;
}

const SegmentStreamTile = observer(({ size, slots, pause, duration, config }: TileProps) => {
  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const latestTs = configs.slot < slots.length ? slots[configs.slot].signals.latestTs : 0;

  const chartEl = useRef<Chart<"line">>(null);

  const options = useMemo<ChartOptions<"line">>(() => {
    const showAxis = size === "lg";
    const durationMs = getPlotDurationMs(duration, size);
    const min = configs.segments.reduce((min, seg) => Math.min(min, seg.value), 0);
    const max = configs.segments.reduce((max, seg) => Math.max(max, seg.value), 0);
    return {
      responsive: true,
      maintainAspectRatio: false,
      cubicInterpolationMode: "monotone",
      spanGaps: false,
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
          min: min,
          max: max,
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
          ticks: {
            display: showAxis,
          },
          title: {
            color: theme.palette.text.disabled
          },
          grid: {
            display: true,
            borderColor: theme.palette.text.primary,
            borderWidth: 2,
            color: theme.palette.divider,
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
    return {
      datasets: configs.segments.map((seg) => ({
          label: seg.name.substring(0, 12),
          fill: true,
          backgroundColor: alpha(seg.color, 0.3),
          borderColor: seg.color,
          yAxisID: "y",
          data: [],
      })),
      };
    }, [configs.segments]
  );

  useEffect(() => {
    const chart = chartEl.current;
    const mask = configs.slot < slots.length ? slots[configs.slot].mask : undefined;
    if (pause || !chart || !mask || !latestTs) {
      return;
    }
    const segmentData = mask ? mask.segmentBounds : [];
    for (let i = 0; i < configs.segments.length; i++) {
      const dataset = chart.data.datasets[i];
      if (!dataset) { continue; }
      const segVal = configs.segments[i].value;
      const segData = [] as { x: number; y: number }[];
      for (let bounds of segmentData) {
        if ((bounds.value & configs.segmentMask) === segVal) {
          segData.push({ x: bounds.start, y: segVal });
          segData.push({ x: bounds.end, y: segVal });
          segData.push({ x: bounds.end+1, y: NaN });
        }
      }
      dataset.data = segData;
    }
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

export default SegmentStreamTile;
