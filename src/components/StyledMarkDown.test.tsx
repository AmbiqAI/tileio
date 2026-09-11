// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTheme, ThemeProvider } from '@mui/material';
import StyledMarkDown from './StyledMarkDown';

describe('Markdown headings', () => {
  it.each(['light', 'dark'] as const)('uses neutral medium-weight headings in %s mode', mode => {
    const theme = createTheme({ palette: { mode } });
    const markup = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <StyledMarkDown>{[1, 2, 3, 4, 5, 6].map(level => '#'.repeat(level) + ' Heading').join('\n\n')}</StyledMarkDown>
      </ThemeProvider>,
    );
    for (let level = 1; level <= 6; level++) {
      expect(markup).toContain('<h' + level + ' style="color:' + theme.palette.text.primary + ';margin:4px;font-weight:500;');
    }
  });

  it('preserves explicit heading colors', () => {
    const markup = renderToStaticMarkup(<StyledMarkDown color="#123456"># Heading</StyledMarkDown>);
    expect(markup).toContain('color:#123456');
  });
});
