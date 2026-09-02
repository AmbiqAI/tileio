// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { Instance, SnapshotIn, applySnapshot, cast, destroy, types } from 'mobx-state-tree';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { SegmentType } from './types';
import { binarySearch } from '../components/Tiles/utils';
import { uuid4 } from '../utils';
import { cloneDeep } from 'lodash';

export const SlotConfigSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    required: ['name', 'enabled', 'type', 'unit', 'fs', 'chs', 'metrics'],
    properties: {
      name: {
        type: 'string',
        default: 'Name',
        description: 'Slot name'
      },
      enabled: {
        type: 'boolean',
        default: true,
        description: 'Enable slot'
      },
      type: {
        type: 'string',
        default: 'ecg',
        description: 'Slot type'
      },
      unit: {
        type: 'string',
        default: 'mV',
        description: 'Slot units'
      },
      fs: {
        type: 'number',
        default: 200,
        description: 'Sampling frequency',
      },
      dtype: {
        type: 'string',
        enum: ['u8', 'i8', 'u16', 'i16', 'u32', 'i32', 'f32'],
        default: 'i16',
        description: 'Data type'
      },
      chs: {
        type: 'array',
        minItems: 1,
        maxItems: 4,
        items: {
          type: 'string',
          minLength: 1,
        },
        default: ['ch0'],
        description: 'Channels',
      },
      metrics: {
        type: 'array',
        minItems: 1,
        maxItems: 40,
        items: {
          type: 'string',
        },
        default: ['met0'],
        description: 'Metrics',
      }
    }
  },
  uischema: {
    "slot": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "metric": {
    },
    "primaryColor": {
      "ui:widget": "color"
    },
    "secondaryColor": {
      "ui:widget": "color"
    }
  }
}

export const SlotsConfigSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    type: 'object',
    required: ['name', 'location', 'slots'],
    properties: {
      slots: {
        type: 'array',
        minItems: 4,
        maxItems: 4,
        items: SlotConfigSchema.schema,
        description: 'Slots',
      }
    }
  },
  uischema: {
    slots: {
      items: SlotConfigSchema.uischema
    },
  }
};

export const SlotConfig = types
.model('SlotConfig', {
  name: types.string,
  enabled: types.optional(types.boolean, true),
  type: types.optional(types.string, 'ecg'),
  unit: types.optional(types.string, 'mV'),
  fs: types.optional(types.number, 100),
  dtype: types.optional(types.string, 'i16'),
  chs: types.optional(types.array(types.string), ['ch0']),
  metrics: types.optional(types.array(types.string), ['met0']),
})
.views(self => ({
  get dtypeFullName() {
    return self.dtype === 'u8' ? 'uint8' :
      self.dtype === 'i8' ? 'int8' :
      self.dtype === 'u16' ? 'uint16' :
      self.dtype === 'i16' ? 'int16' :
      self.dtype === 'u32' ? 'uint32' :
      self.dtype === 'i32' ? 'int32' :
      self.dtype === 'f32' ? 'float32' : 'int16';
  }
}))
.actions(self => ({
  setName: function(name: string) {
    if (name == null) { return; }
    self.name = name;
  },
  setEnabled: function(enabled: boolean) {
    if (enabled == null) { return; }
    self.enabled = enabled;
  },
  setType: function(type: string) {
    if (type == null) { return; }
    self.type = type;
  },
  setUnit: function(unit: string) {
    if (unit == null) { return; }
    self.unit = unit;
  },
  setFs: function(fs: number) {
    if (fs == null) { return; }
    self.fs = fs;
  },
  setChs: function(chs: string[]) {
    if (chs == null) { return; }
    self.chs = cast(chs);
  },
  setMetrics: function(metrics: string[]) {
    if (metrics == null) { return; }
    self.metrics = cast(metrics);
  },
  copyFrom: function(other: ISlotConfigSnapshot) {
    applySnapshot(self, cloneDeep(other));
  },

}));

export interface ISlotConfig extends Instance<typeof SlotConfig> {}
export interface ISlotConfigSnapshot extends SnapshotIn<typeof SlotConfig> {}

/**
 * Sentinel mask value marking a break in the stream. Real masks are unsigned
 * bit fields, so a negative value cannot collide with one.
 */
export const MASK_BREAK = -1;

/**
 * Time hole, in ms, that forces a trace break even when the transport did not
 * report a discontinuity (e.g. a reconnect or a paused stream). The playout
 * clock keeps samples evenly spaced, so any hole this large is a real outage.
 */
export const STREAM_BREAK_GAP_MS = 1000;

/**
 * True when a break marker must be inserted before `firstTs`: either the
 * transport reported a playout-clock discontinuity, or the timeline has a hole
 * no regular sample stream could produce.
 */
function needsBreak(hasData: boolean, latestTs: number, firstTs: number, discontinuity: boolean): boolean {
  if (!hasData || firstTs <= latestTs) {
    return false;
  }
  return discontinuity || firstTs - latestTs > STREAM_BREAK_GAP_MS;
}

/**
 * Timestamp of the break marker: just after the last real sample, so a
 * segmentation band ends where its data ends instead of being stretched across
 * the hole. Always strictly between `latestTs` and `firstTs`.
 */
function breakTimestamp(latestTs: number, firstTs: number): number {
  return Math.min(latestTs + 1, (latestTs + firstTs) / 2);
}

export const SlotSignals = types
.model('SlotSignals', {
  latestTs: types.optional(types.number, 0),
}).volatile(self => ({
  // [ts, ch0, ch1, ...][]
  data: [] as number[][],
})).views(self => ({
})).actions(self => ({
  /**
   * Append decoded samples. When `discontinuity` is set (or a large time hole
   * is detected) a NaN row is inserted first so the chart splits the trace
   * instead of interpolating across missing data.
   */
  add: function(data: number[][], discontinuity: boolean = false) {
    if (data.length) {
      if (needsBreak(self.data.length > 0, self.latestTs, data[0][0], discontinuity)) {
        const breakTs = breakTimestamp(self.latestTs, data[0][0]);
        self.data.push([breakTs, ...new Array(data[0].length - 1).fill(NaN)]);
      }
      self.data.push(...data);
      self.latestTs = data[data.length-1][0];
    }
  },
  clear: function() {
    self.data = [];
    self.latestTs = 0;
  },
  prune: function(oldestTs: number) {
    const idx = binarySearch(self.data, oldestTs, (a, b) => a - b[0]);
    self.data.splice(0, idx);
    self.latestTs = self.data.length ? self.data[self.data.length-1][0] : 0;
  }
}));

// [5-0] : 6-bit segmentation
// [7-6] : 2-bit QoS (0:bad, 1:poor, 2:fair, 3:good)
// [15-8] : 8-bit Fiducial

const SIG_SEG_OFFSET = 0;
const SIG_SEG_MASK = 0x03F;
const SIG_QOS_OFFSET = 6;
const SIG_QOS_MASK = 0x03;
const SIG_FID_OFFSET = 8;
const SIG_FID_MASK = 0xFF;

/** Segmentation value of a mask row, preserving the {@link MASK_BREAK} sentinel. */
function segmentValue(row: number[]): number {
  return row[1] === MASK_BREAK ? MASK_BREAK : (row[1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
}

export const getQoSName = (connected: boolean, state: number) => {
  if (!connected) {
    return "OFF";
  } else if (state === 3) {
    return "GOOD";
  } else if (state === 2) {
    return "FAIR";
  } else if (state === 1) {
    return "POOR";
  }
  return "BAD";
}

export const getQoSColor = (connected: boolean, state: number) => {
  if (!connected) {
    return "gray";
  } else if (state === 3) {
    return "#59f473"; // green
  } else if (state === 2) {
    return "#f1f459"; // yellow
  } else if (state === 1) {
    return "#f4a459"; // orange
  }
  return "#f16757"; // red
}

export const SlotMask = types
.model('SlotMask', {
  latestTs: types.optional(types.number, 0),
}).volatile(self => ({
  // [ts, mask][]
  data: [] as number[][],
})).views(self => ({
  get segmentBounds(): SegmentType[] {
    const bounds = [];
    const latestTs = self.latestTs;
    let start = 0;
    let end = 0;
    let prev = self.data.length > 0 ? segmentValue(self.data[0]) : 0;
    for(let i = 1; i < self.data.length; i++) {
      let curr = segmentValue(self.data[i]);
      if (prev !== curr) {
        end = self.data[i][0];
        // A break marker terminates the run and emits no bounds of its own, so
        // the missing interval renders as a gap rather than a stretched band.
        if (prev !== MASK_BREAK && start >= 0 && end <= latestTs) {
          bounds.push({start, end, value: prev, label: ""});
        }
        start = end;
        prev = curr;
      }
    }

    return bounds;
  },
  get segmentAmounts(): {[key: number]: number} {
    const amounts = {} as {[key: number]: number};
    const latestTs = self.latestTs;
    let duration = 0;
    let startIdx = 0;
    let prev = self.data.length > 0 ? segmentValue(self.data[0]) : 0;
    for(let i = 1; i < self.data.length; i++) {
      let curr = segmentValue(self.data[i]);
      if (prev !== curr) {
        duration = i - startIdx;
        if (prev !== MASK_BREAK && startIdx >= 0 && self.data[i][0] <= latestTs) {
          if (amounts[prev]) {
            amounts[prev] += duration;
          } else {
            amounts[prev] = duration;
          }
        }
        startIdx = i;
        prev = curr;
      }
    }

    // for(let i = 1; i < self.data.length; i++) {
    //   let prev = (self.data[i-1][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
    //   let curr = (self.data[i][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
    //   if (!prev && curr) {
    //     startIdx = i;
    //   } else if (prev && !curr) {
    //     if (startIdx >= 0 && self.data[i][0] <= latestTs) {
    //       duration = i - startIdx;
    //       if (amounts[prev]) {
    //         amounts[prev] += duration;
    //       } else {
    //         amounts[prev] = duration;
    //       }
    //     }
    //     startIdx = -1;
    //   }
    // }
    return amounts;
  },
  get fiducials() {
    const fiducials = [];
    const latestTs = self.latestTs;
    for(let i = 0; i < self.data.length; i++) {
      if (self.data[i][1] === MASK_BREAK) { continue; }
      const ts = self.data[i][0];
      const value = (self.data[i][1] >> SIG_FID_OFFSET) & SIG_FID_MASK;
      if (value && ts <= latestTs) {
        fiducials.push({ts, value, label: ""});
      }
    }
    return fiducials;
  },
  get qos(): number[] {
    // eslint-disable-next-line
    const latestTs = self.latestTs;
    return self.data.filter(d => d[1] !== MASK_BREAK).map(d => (d[1] >> SIG_QOS_OFFSET) & SIG_QOS_MASK);
  }
})).views(self => ({
  get fiducialAmounts(): {[key: number]: number} {
    const fiducials = self.fiducials;
    const amounts = {} as {[key: number]: number};
    for (const f of fiducials) {
      if (amounts[f.value]) {
        amounts[f.value] += 1;
      } else {
        amounts[f.value] = 1;
      }
    }
    return amounts;
  },
  get qosState(): number {
    // The header badge represents current signal quality. Averaging the
    // retained plot history made it lag behind a recovered PPG signal.
    return self.qos.length ? self.qos[self.qos.length - 1] : 0;
  }

})).actions(self => ({
  /** Append mask rows, inserting a {@link MASK_BREAK} row at a discontinuity. */
  add: function(data: number[][], discontinuity: boolean = false) {
    if (data.length) {
      if (needsBreak(self.data.length > 0, self.latestTs, data[0][0], discontinuity)) {
        self.data.push([breakTimestamp(self.latestTs, data[0][0]), MASK_BREAK]);
      }
      self.data.push(...data);
      self.latestTs = data[data.length-1][0];
    }
  },
  clear: function() {
    self.data = [];
    self.latestTs = 0;
  },
  prune: function(oldestTs: number) {
    const idx = binarySearch(self.data, oldestTs, (a, b) => a - b[0]);
    self.data.splice(0, idx);
    self.latestTs = self.data.length ? self.data[self.data.length-1][0] : 0;
  }
}));

export const SlotMetrics = types
.model('SlotMetrics', {
  latestTs: types.optional(types.number, 0),
}).volatile(self => ({
    // [ts, met0, met1, ...][]
    data: [] as number[][],
})).views(self => ({
})).actions(self => ({
  add: function(data: number[][]) {
    if (data.length) {
      self.data.push(...data);
      self.latestTs = data[data.length-1][0];
    }
  },
  clear: function() {
    self.data = [];
    self.latestTs = 0;
  },
  prune: function(oldestTs: number) {
      const idx = binarySearch(self.data, oldestTs, (a, b) => a - b[0]);
      self.data.splice(0, idx);
  },
  numMetrics: function() {
    return self.data.length ? self.data[0].length - 1 : 0;
  }
}));

export const Slot = types
.model('Slot', {
  id: types.optional(types.string, uuid4),
  signals: types.optional(SlotSignals, {}),
  mask: types.optional(SlotMask, {}),
  metrics: types.optional(SlotMetrics, {}),
})
.volatile(self => ({
}))
.actions(self => ({
  add: function(signals: number[][], mask: number[][], discontinuity: boolean = false) {
    self.signals.add(signals, discontinuity);
    self.mask.add(mask, discontinuity);
  },
  addMetrics: function(metrics: number[][]) {
    self.metrics.add(metrics);
  },
  clear: function() {
    self.signals.clear();
    self.mask.clear();
    self.metrics.clear();
  },
  prune: function(oldestTs: number) {
    self.signals.prune(oldestTs);
    self.mask.prune(oldestTs);
    self.metrics.prune(oldestTs);
  },
  delete: function() {
    destroy(self)
  }
}));

export interface ISlot extends Instance<typeof Slot> {}
export interface ISlotSnapshot extends SnapshotIn<typeof Slot> {}
