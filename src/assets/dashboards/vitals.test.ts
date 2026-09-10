// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { describe, expect, it } from 'vitest';
import dashboard from './hk-ap510-vs-ap4.json';

describe('Vital Sign Monitoring template', () => {
  it('keeps ECG segment identities and colors aligned', () => {
    const segments = [
      { name: 'P-Wave', value: 1, color: '#00dfea' },
      { name: 'QRS', value: 2, color: '#bd6bf0' },
      { name: 'T-Wave', value: 3, color: '#94a3b8' },
    ];
    for (const type of ['SEGMENTS_STREAM_TILE', 'SEG_PIE_TILE']) {
      expect(dashboard.tiles.find(tile => tile.type === type)?.config)
        .toMatchObject({ slot: 0, segmentMask: 63, segments });
    }
  });
  it('retains concise metric names and scale headroom', () => {
    expect(dashboard.tiles.find(tile => tile.config.name === 'AI Throughput')?.config)
      .toMatchObject({ max: 150 });
    const names = dashboard.tiles.map(tile => tile.config.name);
    for (const name of ['MCU Battery Life', 'AI Throughput', 'Denoise Efficiency',
      'Segment Efficiency', 'Arrhythmia Efficiency']) expect(names).toContain(name);
    expect(dashboard.tiles.find(tile => tile.config.name === 'Arrhythmia Efficiency')?.config)
      .toMatchObject({ slot: 0, metric: 10, max: 40000 });
  });
  it('uses the demo name and heartKIT branding', () => {
    expect(dashboard.name).toBe('Vital Sign Monitoring');
    expect(JSON.stringify(dashboard)).not.toContain('HeartKit');
    expect(dashboard.description).toContain('heliaAOT');
    expect(dashboard.description).toContain('SPOT');
    expect(dashboard.description).toContain('Helium MVE');
    expect(dashboard.tiles[4]).toMatchObject({ type: 'SVG_TILE', config: {
      name: 'heartKIT', content: expect.stringContaining('<svg'),
      darkContent: expect.stringContaining('<svg'),
    } });
  });
  it('scopes memory comparisons and keeps internal review notes out of the description', () => {
    const slides = dashboard.tiles[21].config.slides!;
    for (const [model, bss] of [
      [0, [326084, 220388]],
      [1, [326084, 175124]],
      [2, [326084, 183492]],
    ] as const) {
      expect(slides[model * 2 + 1]).toMatchObject({
        name: expect.stringContaining('memory footprint'),
        values: bss.map(value => ({ value: value / 1024 })),
      });
    }
    expect(JSON.stringify(dashboard.tiles[21])).not.toMatch(/energy|µJ/i);
    expect(dashboard.description).not.toMatch(/capture timing|customer release|validation remains unresolved/i);
    expect(dashboard.description).toContain('total runtime RAM');
  });
  it('consolidates comparisons and weights the aggregate by invocation rate', () => {
    expect(dashboard.tiles).toHaveLength(23);
    expect(new Set(dashboard.tiles.map(tile => tile.id)).size).toBe(23);
    expect(dashboard.tiles.some(tile => tile.config.name === 'HeartKit QR Code')).toBe(false);
    expect(dashboard.tiles[22].config.slides?.[0]).toMatchObject({
      name: '', values: [{ name: '', label: 'heliaAOT' }],
    });
    expect(dashboard.tiles.some(tile => tile.type === 'POINCARE_PLOT')).toBe(false);
    expect(dashboard.tiles[21]).toMatchObject({ type: 'BAR_SLIDE_TILE', config: {
      slides: Array.from({ length: 6 }, () => ({ type: 'bar', values: [
        { name: 'TFLM', color: '#bd6bf0' }, { name: 'heliaAOT', color: '#00dfea' },
      ] })),
    } });
    expect(dashboard.description).toContain('Reference benchmarks');
    const gain = ((70.905 + 97.280) / 2060 + 21.495 / 2000)
      / ((15.522 + 58.020) / 2060 + 8.249 / 2000);
    expect(dashboard.tiles[22]).toMatchObject({ size: 'sm', type: 'BAR_SLIDE_TILE', config: {
      name: '',
      slides: [
        { name: '', type: 'number', values: [{ value: 0, label: 'heliaAOT', name: '' }] },
        { name: 'Faster inference', type: 'number', values: [{ value: gain, label: '2.32×', name: 'heliaAOT vs TFLM' }] },
        { name: 'Less memory', type: 'number', values: [{
          value: 100 * (1 - (220388 + 175124 + 183492) / (326084 * 3)), label: '41%', name: 'heliaAOT vs TFLM',
        }] },
        { name: 'Energy Efficiency', type: 'number', values: [{
          value: 4, label: 'Up to 4×', name: 'heliaAOT vs TFLM',
        }] },
      ],
    } });
    expect(dashboard.description).toContain('sensor power excluded');
    expect(dashboard.description).toContain('not integrated application RAM');
    expect(dashboard.description.length).toBeLessThan(1500);
  });
});
