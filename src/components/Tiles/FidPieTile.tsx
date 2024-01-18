import { Doughnut } from "react-chartjs-2";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { Stack, Typography, useTheme } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { observer } from "mobx-react-lite";
import { TileProps, TileSpec } from "./BaseTile";
import { ThemeColors } from "../../theme/theme";

export const FidPieTileSpec: TileSpec = {
  type: "FID_PIE_TILE",
  name: "Fiducial Pie Tile",
  description: "Fiducial Pie Tile",
  streamingRequired: true,
  sizes: ["sm", "md"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'units', 'fiducialMask', 'fiducials'],
    properties: {
      name: {
        type: 'string',
        default: 'Fiducials'
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
      fiducialMask: {
        type: 'integer',
        title: 'Fiducial Mask',
        default: 0xFF,
        minimum: 0,
        maximum: 0xFF,
      },
      fiducials: {
        type: 'array',
        title: 'Fiducials',
        items: {
          type: 'object',
          required: ['name', 'color'],
          properties: {
            name: {
              type: 'string',
              default: 'Fiducial'
            },
            value: {
              type: 'integer',
              default: 0xFF,
              minimum: 0,
              maximum: 0xFF,
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
    "fiducials": {
      "items": {
        "color": {
          "ui:widget": "color"
        }
      }
    }
  }
};

export interface FidPieTileConfig {
  name: string;
  units: string,
  slot: number;
  fiducialMask: number;
  fiducials: {name: string, value: number, color: string}[];
}

export function parseConfig(config: { [key: string]: any }): FidPieTileConfig {
  const configs = {
    name: 'Fiducial',
    units: 'Percent',
    slot: 0,
    fiducialMask: 0xFF,
    fiducials: [],
    ...config
  } as FidPieTileConfig;
  return configs;
}


const FidPieTile = observer(({ slots, config }: TileProps) => {

  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);

  const chartEl = useRef<Chart<"doughnut">>(null);

  const latestTs = configs.slot < slots.length ? slots[configs.slot].mask.latestTs : 0;

  const chartData = useMemo<ChartData<"doughnut">>(() => {
    const names = configs.fiducials.map((fiducial) => fiducial.name);
    const colors = configs.fiducials.map((fiducial) => fiducial.color || ThemeColors.colors.primaryColor);
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
            font: {
              size: 14,
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
    const fidAmounts = configs.slot < slots.length ? slots[configs.slot].mask.fiducialAmounts : {};
    const data = configs.fiducials.map((fiducial) => fidAmounts[fiducial.value] || 1e-9);

    if (chart.legend) {
      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
      chart.legend.legendItems = configs.fiducials.map((fiducial, i) => ({
        text: `${fiducial.name}: ${(100*data[i]/total).toFixed(0)}%`,
        fillStyle: fiducial.color || ThemeColors.colors.primaryColor,
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

export default FidPieTile;
