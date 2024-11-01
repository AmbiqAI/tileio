import { Scatter } from "react-chartjs-2";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions, ScriptableContext } from "chart.js";
import { alpha, useTheme } from "@mui/system";
import { TileProps } from "../BaseTile";
import { Stack, Typography } from "@mui/material";
import { GridContainer, GridZStack } from "../utils";
import { ThemeColors } from "../../../theme/theme";
import { observer } from "mobx-react";

import { parseConfig } from "./types";

function getFillColor(color: string): ((context: ScriptableContext<"line">) => string) {
  const fn = (context: ScriptableContext<"line">) => {
    const alphaLevel = Math.max(Math.min(context.dataIndex/context.dataset.data.length, 0.9), 0.1);
    return alpha(color, alphaLevel);
  };
  return fn;
}

const PoincarePlot = observer(({ slots, pause, config }: TileProps) => {
  const theme = useTheme();
  const configs = useMemo(() => parseConfig(config || {}), [config]);
  const mask = configs.slot < slots.length ? slots[configs.slot].mask : undefined;
  const latestTs = mask ? mask.latestTs : 0;

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
    [configs.primaryColor]
  );

  const options = useMemo<ChartOptions<"scatter">>(
    () => {
      const gridColor = alpha(ThemeColors.colors.primaryColor, 0.7);
      return {
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
        title: {
          text: configs.title,
          display: !!configs.title,
          color: theme.palette.text.primary,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
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
            display: !!configs.yTitle,
            text: configs.yTitle || undefined,
            color: theme.palette.text.primary,
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
    }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configs.min, configs.max, configs.name, configs.yTitle, configs.title, theme.palette.divider, theme.palette.text.primary]
  );

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart || !mask) {
      return;
    }
    const peaks = mask.fiducials.filter(f => f.value & configs.fiducial);

    const dataset = chart.data.datasets[0];
    dataset.data.splice(0, dataset.data.length);
    for (let i = 1; i < peaks.length - 1; i++) {
      dataset.data.push({ x: peaks[i].ts - peaks[i - 1].ts, y: peaks[i + 1].ts - peaks[i].ts });
    }
    chart.update("quiet");
  }, [latestTs, mask, configs.fiducial, pause]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ padding: "8px", paddingTop: "0px" }}>
        <Scatter
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
          sx={{ textAlign: "end", pr: 1.0, pb: 0.5 }}
        >
          <Typography color={configs.secondaryColor} fontWeight={700} variant="h6" sx={{ lineHeight: 1 }}>
            {configs.label}
          </Typography>
        </Stack>
      </GridZStack>
    </GridContainer>
  );
});

export default PoincarePlot;
