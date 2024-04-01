import { Line } from "react-chartjs-2";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartArea, ChartData, ChartOptions } from "chart.js";
import { alpha } from "@mui/system";
import { Stack, Typography } from "@mui/material";
import { GridContainer, GridZStack } from "./utils";
import { observer } from "mobx-react";

type Props = {
  name: string;
  latestTs: number;
  data: { ts: number; [key: string]: number; }[];
  units: string;
  primaryColor: string;
  secondaryColor: string;
  min?: number;
  max?: number;
  duration?: number;
  precision?: number;
  yAxisId?: string;
};

function createGradient(
  ctx: CanvasRenderingContext2D,
  area: ChartArea,
  color: string
) {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, alpha(color, 0.0));
  gradient.addColorStop(1, alpha(color, 0.6));
  return gradient;
}

const MetricPlotTile = observer(({
  name,
  latestTs,
  data,
  units,
  primaryColor,
  secondaryColor,
  min,
  max,
  duration,
  precision,
  yAxisId
}: Props) => {

  const ts = data.length ? data[data.length - 1].ts : undefined;
  const value = data.length ? (data[data.length - 1][yAxisId ?? "y"] || 0).toFixed(precision ?? 0) : "--";
  const chartEl = useRef<Chart<"line">>(null);

  const chartData = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "",
          fill: "start",
          tension: 0.4,
          data: [],
        },
      ],
    }),
    []
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: false,
      animation: {
        duration: 0,
      },
      elements: {
        point: { radius: 0 },
      },
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
      },
      scales: {
        y: {
          min: min,
          max: max,
          display: false,
          grid: { display: false },
          position: "center",
          ticks: { display: false },
        },
        x: {
          type: "time",
          reverse: false,
          grid: { display: false },
          ticks: { display: false },
        },
      },
      parsing: {
        xAxisKey:  "ts",
        yAxisKey: yAxisId ?? "y",
      }
    }),
    [min, max, yAxisId]
  );

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart) {
      return;
    }
    chart.data.datasets = [
      {
        label: name,
        backgroundColor: createGradient(
          chart.ctx,
          chart.chartArea,
          primaryColor
        ),
        borderColor: alpha(primaryColor, 0.6),
        fill: "start",
        tension: 0.4,
        data: [],
      },
    ];
    chart.update("none");
    return;
  }, [name, primaryColor]);

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart || !data.length || !latestTs) {
      return;
    }
    // @ts-ignore
    chart.data.datasets[0].data = data;
    if (duration && ts) {
      chart.options.scales!.x!.max = ts;
      chart.options.scales!.x!.min = ts - duration*1000;
    }
    chart.update("none");
  }, [data, latestTs, duration, ts]);

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
            pt: 1.2,
          }}
        >
          <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1 }}>
            {name}
          </Typography>
        </Stack>
      </GridZStack>
      <GridZStack level={0}>
        <Line
          style={{ margin: "0px -2px -8px -2px" }}
          ref={chartEl}
          data={chartData}
          options={options}
        />
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
            pr: 0.5,
            pb: 0.5,
          }}
        >
          <Typography fontWeight={900} variant="h3" sx={{ lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography color={secondaryColor} fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
            {units}
          </Typography>
        </Stack>
      </GridZStack>
    </GridContainer>
  );
});

export default MetricPlotTile;
