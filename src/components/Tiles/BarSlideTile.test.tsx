// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NumbersSlide } from './BarSlideTile';

describe('Number slide layout', () => {
  it('fits a longer energy headline in a small card', () => {
    const html = renderToStaticMarkup(<NumbersSlide name="Energy Efficiency" type="number" size="sm"
      values={[{ name: 'heliaAOT vs TFLM', value: 4, label: 'Up to 4×', color: '#00dfea' }]} />);
    expect(html).toContain('Up to 4×');
    expect(html).toContain('20cqw');
    expect(html).not.toContain('estimated');
  });

  it('separates metric, value, and comparison without an underline', () => {
    const html = renderToStaticMarkup(<NumbersSlide name="Faster inference" type="number" size="sm"
      values={[{ name: 'heliaAOT vs TFLM', value: 2.32, label: '2.32×', color: '#00dfea' }]} />);
    expect(html).toContain('Faster inference');
    expect(html).toContain('2.32×');
    expect(html).toContain('heliaAOT vs TFLM');
    expect(html).toContain('grid-template-rows:28px minmax(0, 1fr) 24px');
    expect(html).not.toContain('border-bottom');
  });

  it('centers a wordmark without reserving heading or caption rows', () => {
    const html = renderToStaticMarkup(<NumbersSlide name="" type="number" size="sm"
      values={[{ name: '', value: 0, label: 'heliaAOT', color: '#00dfea' }]} />);
    expect(html).toContain('heliaAOT');
    expect(html).toContain('grid-template-rows:1fr');
    expect(html).not.toContain('<h3');
  });

  it('retains multi-value labels', () => {
    const html = renderToStaticMarkup(<NumbersSlide name="Comparison" type="number" size="md"
      values={[{ name: 'A', value: 1, color: '#00dfea' }, { name: 'B', value: 2, color: '#bd6bf0' }]} />);
    expect(html).toContain('Comparison');
    expect(html).toContain('>A<');
    expect(html).toContain('>B<');
  });
});
