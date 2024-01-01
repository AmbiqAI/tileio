import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef } from "react";
import { TileProps } from "./BaseTile";
import { binarySearch, GridContainer, GridZStack } from "./utils";
import { ThemeColors } from "../../theme/theme";
import { pkStreamPlotDelayMs, pkPlotGapSizeMs, getPlotDurationMs, pkStreamFPS } from "../constants";

const MetricsPlot = ({ size, slots, pause, duration }: TileProps) => {
  const slotIdx = 0;
  const slot = slots[slotIdx];
  const metrics = slot.metrics;
  const metricNames = Array(metrics.numMetrics()).fill(0).map((_, i) => `M${i+1}`);
  const showAxis = size === "lg";
  const durationMs = getPlotDurationMs(duration, size);
  const chartEl = useRef<Chart<"line">>(null);

  const data = useMemo<ChartData<"line">>(
    () => ({
      datasets: metricNames.map((name) => ({
        label: name,
        fill: false,
        data: [],
        borderColor: "red",
        pointRadius: 2,
        hoverWidth: 2,
        yAxisID: "y1",
      })),
    }),
    [metricNames]
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: pkPlotGapSizeMs,
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
        tooltip: { enabled: true },
        legend: {
          fullSize: true,
          position: "top",
          align: "center",
          labels: {
            font: { size: 14, weight: "bold" },
          },
        },
      },
      scales: {
        y: {
          stacked: false,
          display: showAxis,
          grid: {
            borderColor: ThemeColors.colors.greyAlpha,
            borderWidth: 2,
          },
        },
        y1: {
          display: showAxis,
          position: "right",
          grid: { display: false },
        },
        x: {
          type: "realtime",
          display: showAxis,
          grid: {
            borderColor: ThemeColors.colors.greyAlpha,
            borderWidth: 2,
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
    [durationMs, pause, showAxis]
  );

  useEffect(() => {
    const chart = chartEl.current;
    if (!chart || pause ) { return; }
    for (let i = 0; i < metrics.numMetrics(); i++) {
      const chartData = chart.data.datasets[i]!.data as { x: number; y: number }[];
      const name = metricNames[i];
      const newData = metrics.data.map((m) => ({ x: m[0], y: m[i+1] }));
      // Find if any new data to append
      const newMetricsIdx = chartData.length ? binarySearch(newData, chartData[chartData.length - 1].x, (a, b) => a - b.x) : 0;
      if (newMetricsIdx >= newData.length) { return; }
      chartData.push(...newData.slice(newMetricsIdx));
    }
    chart.update("quiet");
  }, [metrics, pause]);

  return (
    <GridContainer>
      <GridZStack level={0} style={{ margin: 4 }}>
        <Line ref={chartEl} data={data} options={options} />
      </GridZStack>
    </GridContainer>
  );
};

export default MetricsPlot;
