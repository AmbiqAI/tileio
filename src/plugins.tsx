import {
  ArcElement,
  Chart,
  LineController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  SubTitle,
} from "chart.js";
import "chartjs-adapter-luxon";
import AnnotationPlugin from "chartjs-plugin-annotation";
import StreamingPlugin from "chartjs-plugin-streaming";
import ZoomPlugin from "chartjs-plugin-zoom";
import { registerTile } from "./components/Tiles/BaseTile";
import SignalStateTile, { SignalStateSpec } from "./components/Tiles/SignalStateTile";
import MarkdownTile, { MarkdownTileSpec } from "./components/Tiles/MarkdownTile";
// import MetricsPlot, { MetricsPlotSpec } from "./components/Tiles/MetricsPlot";
import EventTile, { EventTileSpec } from "./components/Tiles/EventTile";
import PoincarePlot, { PoincarePlotSpec } from "./components/Tiles/PoincarePlot";
import SparklineTile, { SparklineTileSpec } from "./components/Tiles/SparklineTile";
import BarSlideTile, { BarSlideTileSpec } from "./components/Tiles/BarSlideTile";
import StreamPlotTile, { StreamPlotTileSpec } from "./components/Tiles/StreamPlotTile";
import SegPieTile, { SegPieTileSpec } from "./components/Tiles/SegPieTile";
import UioTile, { UioTileSpec} from "./components/Tiles/UioTile";

registerTile(SignalStateSpec.type, SignalStateSpec, SignalStateTile);
registerTile(MarkdownTileSpec.type, MarkdownTileSpec, MarkdownTile);
// registerTile(MetricsPlotSpec.type, MetricsPlotSpec, MetricsPlot);
registerTile(EventTileSpec.type, EventTileSpec, EventTile);
registerTile(PoincarePlotSpec.type, PoincarePlotSpec, PoincarePlot);
registerTile(SparklineTileSpec.type, SparklineTileSpec, SparklineTile);
registerTile(BarSlideTileSpec.type, BarSlideTileSpec, BarSlideTile);
registerTile(StreamPlotTileSpec.type, StreamPlotTileSpec, StreamPlotTile);
registerTile(SegPieTileSpec.type, SegPieTileSpec, SegPieTile);
registerTile(UioTileSpec.type, UioTileSpec, UioTile);

Chart.register(
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  SubTitle,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);
Chart.register(StreamingPlugin);
Chart.register(ZoomPlugin);
Chart.register(AnnotationPlugin);
