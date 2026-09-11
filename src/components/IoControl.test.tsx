// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import IoControl from './IoControl';
import { IIoConfig, UIOType } from '../models/uioState';

vi.mock('../models/uioState', () => ({
  UIOType: { Select: 'Select', Slider: 'Slider', Toggle: 'Toggle', Momentary: 'Momentary' },
}));

const info = { name: 'CPU Speed', ioType: UIOType.Select, enabled: true,
  direction: 'Input', selectInputs: ['LP Mode', 'HP Mode'] } as IIoConfig;

describe('compact I/O controls', () => {
  it('places an accessible label above a compact select', () => {
    const html = renderToStaticMarkup(<IoControl io={0} info={info} state={0}
      onChange={async () => {}} disabled={false} compact />);
    expect(html.indexOf('title="CPU Speed"')).toBeLessThan(html.indexOf('role="combobox"'));
    expect(html).toContain('aria-label="CPU Speed"');
    expect(html).toContain('height:36px');
    expect(html).toContain('LP Mode');
  });

  it('preserves the standard control layout for other views', () => {
    const html = renderToStaticMarkup(<IoControl io={0} info={info} state={0}
      onChange={async () => {}} disabled={false} />);
    expect(html).toContain('min-width:110px');
    expect(html).not.toContain('title="CPU Speed"');
  });

  it('keeps output-only selects disabled', () => {
    const html = renderToStaticMarkup(<IoControl io={0} info={{ ...info, direction: 'Output' } as IIoConfig}
      state={1} onChange={async () => {}} disabled={false} compact />);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('HP Mode');
  });
});
