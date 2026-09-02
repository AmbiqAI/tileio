// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { describe, expect, it } from 'vitest';
import { MASK_BREAK, Slot, SlotMask, SlotSignals } from './slot';

/** Mask word with segmentation value `seg` in the low 6 bits. */
const seg = (value: number) => value;

describe('SlotSignals break markers', () => {
  it('inserts a NaN row on a reported discontinuity', () => {
    const signals = SlotSignals.create({});
    signals.add([[1000, 1], [1010, 2]]);
    signals.add([[1020, 3], [1030, 4]], true);

    const tsList = signals.data.map((row) => row[0]);
    expect(tsList).toEqual([1000, 1010, 1011, 1020, 1030]);
    expect(Number.isNaN(signals.data[2][1])).toBe(true);
    expect(signals.latestTs).toBe(1030);
  });

  it('does not insert a marker for normal contiguous frames', () => {
    const signals = SlotSignals.create({});
    signals.add([[1000, 1], [1010, 2]]);
    signals.add([[1020, 3], [1030, 4]]);
    expect(signals.data).toHaveLength(4);
    expect(signals.data.every((row) => !Number.isNaN(row[1]))).toBe(true);
  });

  it('inserts a marker for a large time hole even without a flag (reconnect)', () => {
    const signals = SlotSignals.create({});
    signals.add([[1000, 1]]);
    signals.add([[9000, 2]]);
    expect(signals.data).toHaveLength(3);
    expect(Number.isNaN(signals.data[1][1])).toBe(true);
  });

  it('never inserts a marker before the first frame', () => {
    const signals = SlotSignals.create({});
    signals.add([[1000, 1]], true);
    expect(signals.data).toHaveLength(1);
  });

  it('matches the incoming channel count on the marker row', () => {
    const signals = SlotSignals.create({});
    signals.add([[1000, 1, 2, 3]]);
    signals.add([[1020, 4, 5, 6]], true);
    expect(signals.data[1]).toHaveLength(4);
    expect(signals.data[1].slice(1).every((v) => Number.isNaN(v))).toBe(true);
  });
});

describe('SlotMask break markers', () => {
  it('splits segment bounds at a discontinuity instead of spanning it', () => {
    const mask = SlotMask.create({});
    // One continuous run of segment 2, interrupted by a reported discontinuity.
    mask.add([[1000, seg(2)], [1010, seg(2)], [1020, seg(2)]]);
    mask.add([[3000, seg(2)], [3010, seg(2)], [3020, seg(1)]], true);

    const bounds = mask.segmentBounds;
    // Without the break marker this would be one band stretched over the hole.
    // Instead the first band ends just after its last sample and the second
    // starts where data resumed, leaving 1021..3000 unbanded.
    expect(bounds).toHaveLength(2);
    expect(bounds.map((b) => b.value)).toEqual([2, 2]);
    expect(bounds[0].end).toBe(1021);
    expect(bounds[1].start).toBe(3000);
    expect(bounds[1].end).toBe(3020);
    expect(mask.data.some((row) => row[1] === MASK_BREAK)).toBe(true);
  });

  it('emits no band for the break itself', () => {
    const mask = SlotMask.create({});
    mask.add([[1000, seg(2)], [1010, seg(2)]]);
    mask.add([[1020, seg(3)], [1030, seg(3)], [1040, seg(4)]], true);
    const bounds = mask.segmentBounds;
    expect(bounds.map((b) => b.value)).toEqual([2, 3]);
    expect(bounds.every((b) => b.value !== MASK_BREAK)).toBe(true);
  });

  it('keeps break rows out of qos and fiducials', () => {
    const mask = SlotMask.create({});
    mask.add([[1000, 0xC0]]);            // qos = 3 (good), no fiducial
    mask.add([[1020, 0xC0]], true);      // marker inserted between the two
    expect(mask.qos).toEqual([3, 3]);
    expect(mask.fiducials).toHaveLength(0);
    expect(mask.qosState).toBe(3);
  });
});

describe('Slot.add', () => {
  it('propagates the discontinuity flag to both signals and mask', () => {
    const slot = Slot.create({});
    slot.add([[1000, 1]], [[1000, 0]]);
    slot.add([[1020, 2]], [[1020, 0]], true);
    expect(slot.signals.data).toHaveLength(3);
    expect(slot.mask.data).toHaveLength(3);
    expect(slot.mask.data[1][1]).toBe(MASK_BREAK);
  });
});
