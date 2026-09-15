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
  it('scopes memory comparisons and keeps internal review notes out of the description', () => {
    const slides = dashboard.tiles[21].config.slides!;
    for (const [model, ram] of [
      [0, [450796, 223208]],
      [1, [456116, 178080]],
      [2, [484852, 186672]],
    ] as const) {
      expect(slides[model * 3 + 2]).toMatchObject({
        name: expect.stringContaining('memory footprint'),
        values: ram.map(value => ({ value: value / 1024 })),
      });
    }
    expect(dashboard.description).not.toMatch(/capture timing|customer release|validation remains unresolved/i);
    expect(dashboard.description).toContain('total RAM');
    expect(dashboard.description).toContain('TFLM arena reservation');
  });
  it('uses matched latency and energy measurements', () => {
    const slides = dashboard.tiles[21].config.slides!;
    for (const [model, latency, energy] of [
      [0, [73.420, 15.388], [403.586, 95.477]],
      [1, [99.671, 56.981], [509.753, 300.383]],
      [2, [21.839, 8.122], [119.661, 49.263]],
    ] as const) {
      expect(slides[model * 3]).toMatchObject({
        name: expect.stringContaining(`${(latency[0] / latency[1]).toFixed(2)}× speedup`),
        values: latency.map(value => ({ value, label: `${value.toFixed(2)} ms` })),
      });
      expect(slides[model * 3 + 1]).toMatchObject({
        name: expect.stringContaining('relative energy · TFLM = 100'),
        values: energy.map(value => ({
          value: 100 * value / energy[0],
          label: (100 * value / energy[0]).toFixed(1).replace(/\.0$/, ''),
        })),
      });
      expect(JSON.stringify(slides[model * 3 + 1])).not.toMatch(/µJ|mW/);
    }
  });
  it('keeps the layout and scopes maximum gains separately from combined RAM', () => {
    expect(dashboard.tiles).toHaveLength(23);
    expect(new Set(dashboard.tiles.map(tile => tile.id)).size).toBe(23);
    expect(dashboard.tiles.some(tile => tile.config.name === 'HeartKit QR Code')).toBe(false);
    expect(dashboard.tiles[22].config.slides?.[0]).toMatchObject({
      name: '', values: [{ name: '', label: 'heliaAOT' }],
    });
    expect(dashboard.tiles.some(tile => tile.type === 'POINCARE_PLOT')).toBe(false);
    expect(dashboard.tiles[21]).toMatchObject({ type: 'BAR_SLIDE_TILE', config: {
      slides: Array.from({ length: 9 }, () => ({ type: 'bar', values: [
        { name: 'TFLM', color: '#bd6bf0' }, { name: 'heliaAOT', color: '#00dfea' },
      ] })),
    } });
    expect(dashboard.description).toContain('Reference benchmarks');
    const gain = Math.max(73.420 / 15.388, 99.671 / 56.981, 21.839 / 8.122);
    const energyGain = Math.max(403.586 / 95.477, 509.753 / 300.383, 119.661 / 49.263);
    expect(dashboard.tiles[22]).toMatchObject({ size: 'sm', type: 'BAR_SLIDE_TILE', config: {
      name: '',
      slides: [
        { name: '', type: 'number', values: [{ value: 0, label: 'heliaAOT', name: '' }] },
        { name: 'Faster inference', type: 'number', values: [{ value: gain, label: 'Up to 5×', name: 'heliaAOT vs TFLM' }] },
        { name: 'Less memory', type: 'number', values: [{
          value: 100 * (1 - (223208 + 178080 + 186672) / (450796 + 456116 + 484852)), label: '60%', name: 'heliaAOT vs TFLM',
        }] },
        { name: 'Energy Efficiency', type: 'number', values: [{
          value: energyGain, label: 'Up to 4×', name: 'heliaAOT vs TFLM',
        }] },
      ],
    } });
    expect(dashboard.description).toContain('sensor power excluded');
    expect(dashboard.description).toContain('not integrated application RAM');
    expect(dashboard.description.length).toBeLessThan(1500);
  });
});
