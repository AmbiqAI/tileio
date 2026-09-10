// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq
import { expect, it } from 'vitest';
import { transformMetric } from './SparklineTile';

it('converts efficiency to energy without changing unconfigured metrics', () => {
  expect(transformMetric(10000, 'ips_per_watt_to_uj')).toBe(100);
  expect(transformMetric(20000, 'ips_per_watt_to_uj')).toBe(50);
  expect(transformMetric(10000)).toBe(10000);
  expect(transformMetric(0)).toBe(0);
});

it('leaves invalid energy samples unavailable', () => {
  for (const value of [0, -1, NaN, Infinity]) {
    expect(transformMetric(value, 'ips_per_watt_to_uj')).toBeNaN();
  }
});
