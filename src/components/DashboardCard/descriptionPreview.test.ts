// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { describe, expect, it } from 'vitest';
import { descriptionPreview } from './descriptionPreview';

describe('descriptionPreview', () => {
  it.each([
    ['# Overview\nA compact description.', 'A compact description.'],
    ['# Overview\n\nA compact description.\n\nMore detail.', 'A compact description.'],
    ['## Overview\r\nA compact description.\r\n\r\nMore detail.', 'A compact description.'],
    ['# Overview\n## Details', ''],
    ['', ''],
    ['#hashtag is prose', '#hashtag is prose'],
  ])('extracts a preview from %j', (markdown, expected) => {
    expect(descriptionPreview(markdown)).toBe(expected);
  });
});
