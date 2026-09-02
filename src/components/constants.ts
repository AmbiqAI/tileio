// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { TileSize } from "./Tiles/BaseTile";

export const NUM_SLOTS = 4;

export const plotDurationLimitsMs = { sm: 10000, md: 20000, lg: 30000 };

export function getPlotDurationMs(duration: number|undefined, size: TileSize) {
    return Math.min(
        duration !== undefined ? 1e3 * duration : 10000,
        plotDurationLimitsMs[size]
      );
}
