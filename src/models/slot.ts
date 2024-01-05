import { Instance, SnapshotIn, cast, destroy, types } from 'mobx-state-tree';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { SegmentType } from './types';
import { binarySearch } from '../components/Tiles/utils';
import { uuid4 } from '../utils';

export const SlotConfigSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    required: ['name', 'type', 'units', 'fs', 'chs', 'metrics'],
    properties: {
      name: {
        type: 'string',
        default: 'Name'
      },
      type: {
        type: 'string',
        default: 'ecg',
        description: 'Type'
      },
      unit: {
        type: 'string',
        default: 'mV',
        description: 'Units'
      },
      fs: {
        type: 'number',
        default: 200,
        description: 'Sampling frequency'
      },
      chs: {
        type: 'array',
        minItems: 1,
        maxItems: 4,
        items: {
          type: 'string',
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

export const SlotConfig = types
.model('SlotConfig', {
  name: types.string,
  type: types.optional(types.string, 'ecg'),
  unit: types.optional(types.string, 'mV'),
  fs: types.optional(types.number, 100),
  chs: types.optional(types.array(types.string), ['ch0']),
  metrics: types.optional(types.array(types.string), ['met0']),
})
.views(self => ({
}))
.actions(self => ({
  setName: function(name: string) {
    if (name == null) { return; }
    self.name = name;
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
}));

export interface ISlotConfig extends Instance<typeof SlotConfig> {}
export interface ISlotConfigSnapshot extends SnapshotIn<typeof SlotConfig> {}

export const SlotSignals = types
.model('SlotSignals', {
  latestTs: types.optional(types.number, 0),
}).volatile(self => ({
  // [ts, ch0, ch1, ...][]
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
    self.latestTs = self.data.length ? self.data[self.data.length-1][0] : 0;
  }
}));

const SIG_SEG_OFFSET = 0;
const SIG_SEG_MASK = 0x03F;
const SIG_QOS_OFFSET = 6;
const SIG_QOS_MASK = 0x03;
const SIG_FID_OFFSET = 8;
const SIG_FID_MASK = 0xFF;

export const SlotMask = types
.model('SlotMask', {
  latestTs: types.optional(types.number, 0),
}).volatile(self => ({
  // [ts, mask][]
  data: [] as number[][],
})).views(self => ({
  // [5-0] : 6-bit segmentation
  // [7-6] : 2-bit QoS (0:bad, 1:poor, 2:fair, 3:good)
  // [15-8] : 8-bit Fiducial
  get segmentBounds(): SegmentType[] {
    const bounds = [];
    const latestTs = self.latestTs;
    let startIdx = 0;
    for(let i = 1; i < self.data.length; i++) {
      let prev = (self.data[i-1][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      let curr = (self.data[i][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      if (!prev && curr) {
        startIdx = i;
      } else if (prev && !curr) {
        if (startIdx >= 0 && self.data[i][0] <= latestTs) {
          bounds.push({start: startIdx, end: i, value: prev, label: ""});
        }
        startIdx = -1;
      }
    }
    return bounds;
  },
  get segmentAmounts(): {[key: number]: number} {
    const amounts = {} as {[key: number]: number};
    const latestTs = self.latestTs;
    let duration = 0;
    let startIdx = 0;
    for(let i = 1; i < self.data.length; i++) {
      let prev = (self.data[i-1][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      let curr = (self.data[i][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      if (!prev && curr) {
        startIdx = i;
      } else if (prev && !curr) {
        if (startIdx >= 0 && self.data[i][0] <= latestTs) {
          duration = i - startIdx;
          if (amounts[prev]) {
            amounts[prev] += duration;
          } else {
            amounts[prev] = duration;
          }
        }
        startIdx = -1;
      }
    }
    return amounts;
  },
  get fiducials() {
    const fiducials = [];
    for(let i = 0; i < self.data.length; i++) {
      let curr = (self.data[i][1] >> SIG_FID_OFFSET) & SIG_FID_MASK;
      if (curr) {
        fiducials.push({ts: self.data[i][0], value: curr, label: ""});
      }
    }
    return fiducials;
  },
  get qos(): number[] {
    return self.data.map(d => (d[1] >> SIG_QOS_OFFSET) & SIG_QOS_MASK);
  }
})).views(self => ({
  get qosState(): number {
    return Math.round(self.qos.reduce((a, b) => a + b, 0) / self.qos.length);
  }

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
  add: function(signals: number[][], mask: number[][]) {
    self.signals.add(signals);
    self.mask.add(mask);
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
