// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card, ThemeProvider } from '@mui/material';
import { getContrastRatio } from '@mui/material/styles';
import { darkTheme, lightTheme } from './theme';
import TileCornerLabel from '../components/Tiles/TileCornerLabel';

describe('dashboard surfaces', () => {
  it.each([lightTheme, darkTheme])('keeps $palette.mode text readable on surfaces', theme => {
    for (const background of [theme.palette.background.default, theme.palette.background.paper]) {
      for (const color of [theme.palette.text.primary, theme.palette.text.secondary]) {
        expect(getContrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each([lightTheme, darkTheme])('uses a shared solid card in $palette.mode mode', theme => {
    const markup = renderToStaticMarkup(<ThemeProvider theme={theme}><Card>Metric</Card></ThemeProvider>);
    expect(markup).toContain(`background-color:${theme.palette.background.paper}`);
    expect(markup).toContain('box-shadow:none');
    expect(markup).not.toContain('backdrop-filter');
  });

  it('keeps large values distinct from compact units', () => {
    const markup = renderToStaticMarkup(<ThemeProvider theme={darkTheme}>
      <TileCornerLabel header="80" subheader="IPS" />
    </ThemeProvider>);
    expect(markup).toContain('tabular-nums');
    expect(markup).toContain('MuiTypography-body2');
    expect(markup).not.toContain('font-weight:900');
  });
});
