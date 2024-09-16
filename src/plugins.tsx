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
// import StreamingPlugin from "chartjs-plugin-streaming";
import StreamingPlugin from "@ambiqai/chartjs-plugin-streaming";
// import ZoomPlugin from "chartjs-plugin-zoom";
import { registerTile } from "./components/Tiles/BaseTile";
import QosTile, { QosTileSpec } from "./components/Tiles/QosTile";
import MarkdownTile, { MarkdownTileSpec } from "./components/Tiles/MarkdownTile";
import MetricsStreamTile, { MetricsStreamTileSpec } from "./components/Tiles/MetricsStreamTile";
import EventTile, { EventTileSpec } from "./components/Tiles/EventTile";
import PoincarePlot, { PoincarePlotSpec } from "./components/Tiles/PoincarePlot";
import SparklineTile, { SparklineTileSpec } from "./components/Tiles/SparklineTile";
import BarSlideTile, { BarSlideTileSpec } from "./components/Tiles/BarSlideTile";
import StreamPlotTile, { StreamPlotTileSpec } from "./components/Tiles/StreamPlotTile";
import SignalPlotTile, { SignalPlotTileSpec } from "./components/Tiles/SignalPlotTile";
import SegmentStreamTile, { SegmentStreamTileSpec } from "./components/Tiles/SegmentStreamTile";
import SegPieTile, { SegPieTileSpec } from "./components/Tiles/SegPieTile";
import FidPieTile, { FidPieTileSpec } from "./components/Tiles/FidPieTile";
import UioTile, { UioTileSpec} from "./components/Tiles/UioTile";
import IoTile, { IoTileSpec} from "./components/Tiles/IoTile";
import MetricTextTile, { MetricTextTileSpec } from "./components/Tiles/MetricTextTile";

import SvgTile, { SvgTileSpec } from "./components/Tiles/SvgTile";

// Register tile plugins and chartjs plugins

registerTile(QosTileSpec.type, QosTileSpec, QosTile);
registerTile(MarkdownTileSpec.type, MarkdownTileSpec, MarkdownTile);
registerTile(EventTileSpec.type, EventTileSpec, EventTile);
registerTile(PoincarePlotSpec.type, PoincarePlotSpec, PoincarePlot);
registerTile(SparklineTileSpec.type, SparklineTileSpec, SparklineTile);
registerTile(BarSlideTileSpec.type, BarSlideTileSpec, BarSlideTile);
registerTile(SignalPlotTileSpec.type, SignalPlotTileSpec, SignalPlotTile);
registerTile(StreamPlotTileSpec.type, StreamPlotTileSpec, StreamPlotTile);
registerTile(MetricsStreamTileSpec.type, MetricsStreamTileSpec, MetricsStreamTile);
registerTile(SegmentStreamTileSpec.type, SegmentStreamTileSpec, SegmentStreamTile);
registerTile(SegPieTileSpec.type, SegPieTileSpec, SegPieTile);
registerTile(FidPieTileSpec.type, FidPieTileSpec, FidPieTile);
registerTile(UioTileSpec.type, UioTileSpec, UioTile);
registerTile(IoTileSpec.type, IoTileSpec, IoTile);
registerTile(SvgTileSpec.type, SvgTileSpec, SvgTile);
registerTile(MetricTextTileSpec.type, MetricTextTileSpec, MetricTextTile);

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
// Chart.register(ZoomPlugin);
Chart.register(AnnotationPlugin);
