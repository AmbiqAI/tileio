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
    expect(dashboard.tiles.find(tile => tile.config.name === 'MCU Battery Life')?.config)
      .toMatchObject({ min: 0, max: 35, units: 'DAYS' });
    expect(dashboard.tiles.find(tile => tile.config.name === 'AI Throughput')?.config)
      .toMatchObject({ max: 150 });
    const names = dashboard.tiles.map(tile => tile.config.name);
    for (const name of ['MCU Battery Life', 'AI Throughput', 'Denoise Efficiency',
      'Segment Efficiency', 'Arrhythmia Efficiency']) expect(names).toContain(name);
    expect(dashboard.tiles.find(tile => tile.config.name === 'Arrhythmia Efficiency')?.config)
      .toMatchObject({ slot: 0, metric: 10, min: 0, max: 150, units: 'µJ/inf', transform: 'ips_per_watt_to_uj' });
    for (const [name, max] of [['Denoise Efficiency', 200], ['Segment Efficiency', 600]] as const) {
      expect(dashboard.tiles.find(tile => tile.config.name === name)?.config)
        .toMatchObject({ min: 0, max, units: 'µJ/inf', transform: 'ips_per_watt_to_uj' });
    }
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
  it('uses only the two qualified SRAM/MRAM latency and memory pairs', () => {
    const slides = dashboard.tiles[21].config.slides!;
    expect(slides).toHaveLength(4);
    for (const [index, latency, ram] of [
      [0, [65.37353515625, 12.22900390625], [290880, 93000]],
      [1, [76.42181396484375, 16.13372802734375], [290880, 50088]],
    ] as const) {
      expect(slides[index * 2]).toMatchObject({
        name: expect.stringContaining(`${(latency[0] / latency[1]).toFixed(2)}× speedup`),
        values: latency.map(value => ({ value, label: `${value.toFixed(2)} ms` })),
      });
      expect(slides[index * 2 + 1]).toMatchObject({
        name: expect.stringContaining('memory footprint'),
        values: ram.map(value => ({ value: value / 1024 })),
      });
    }
    expect(JSON.stringify(slides)).not.toMatch(/Arrhythmia|energy/i);
    expect(dashboard.description).toContain('shared SRAM scratch and MRAM constants');
    expect(dashboard.description).toContain('Stock TFLM/CMSIS-NN');
    expect(dashboard.description).toContain('TFLM arena reservation');
    expect(dashboard.description).toContain('not integrated application RAM');
  });
  it('keeps missing comparisons and historical live power visible', () => {
    expect(dashboard.description).toContain('Arrhythmia comparison is pending');
    expect(dashboard.description).toContain('New energy comparison is pending');
    expect(dashboard.description).toContain('historical September 15 power references');
    expect(dashboard.description).toContain('not live power-meter readings');
    expect(dashboard.description).toContain('sensor power excluded');
    expect(dashboard.description.length).toBeLessThan(1500);
  });
  it('preserves layout and derives headlines from qualifying rows only', () => {
    expect(dashboard.tiles).toHaveLength(23);
    expect(new Set(dashboard.tiles.map(tile => tile.id)).size).toBe(23);
    expect(dashboard.tiles.some(tile => tile.type === 'POINCARE_PLOT')).toBe(false);
    const gain = Math.max(65.37353515625 / 12.22900390625, 76.42181396484375 / 16.13372802734375);
    expect(dashboard.tiles[22].config.slides).toEqual([
      { name: '', type: 'number', values: [{ value: 0, label: 'heliaAOT', name: '', color: '#00dfea', location: 'inside' }] },
      { name: 'Faster inference', type: 'number', values: [{ value: gain, label: 'Up to 5.35×', name: 'heliaAOT vs TFLM', color: '#00dfea', location: 'inside' }] },
      { name: 'Two-model RAM reduction', type: 'number', values: [{
        value: 100 * (1 - (93000 + 50088) / (290880 + 290880)), label: '75.4%', name: 'heliaAOT vs TFLM', color: '#00dfea', location: 'inside',
      }] },
    ]);
  });
});
