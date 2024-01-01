import { TileSize } from "./Tiles/BaseTile";

export const pkStreamPlotDelayMs = 500;
export const pkStreamFPS = 25;
export const pkPlotGapSizeMs = 2000;
export const pkPlotDurationLimitsMs = { sm: 10000, md: 20000, lg: 30000 };

export function getPlotDurationMs(duration: number|undefined, size: TileSize) {
    return Math.min(
        duration !== undefined ? 1e3 * duration : 10000,
        pkPlotDurationLimitsMs[size]
      );
}
