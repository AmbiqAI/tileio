// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { CreateTile } from './index';
import type { TileProps } from './BaseTile';

vi.mock('./BaseTile', () => ({
  RegisteredTiles: {},
  BaseTile: () => <div>Tile content</div>,
}));

it('renders no trailing text outside the tile component', () => {
  const html = renderToStaticMarkup(CreateTile({ type: 'test' } as TileProps));
  expect(html).toBe('<div>Tile content</div>');
});
