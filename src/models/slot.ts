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

// [5-0] : 6-bit segmentation
// [7-6] : 2-bit QoS (0:bad, 1:poor, 2:fair, 3:good)
// [15-8] : 8-bit Fiducial

const SIG_SEG_OFFSET = 0;
const SIG_SEG_MASK = 0x03F;
const SIG_QOS_OFFSET = 6;
const SIG_QOS_MASK = 0x03;
const SIG_FID_OFFSET = 8;
const SIG_FID_MASK = 0xFF;

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
    for(let i = 1; i < self.data.length; i++) {
      let prev = (self.data[i-1][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      let curr = (self.data[i][1] >> SIG_SEG_OFFSET) & SIG_SEG_MASK;
      if (!prev && curr) {
        start = self.data[i][0];
      } else if (prev && !curr) {
        end = self.data[i][0];
        if (start >= 0 && end <= latestTs) {
          bounds.push({start, end, value: prev, label: ""});
        }
        start = -1;
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
    const latestTs = self.latestTs;
    for(let i = 0; i < self.data.length; i++) {
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
    return self.data.map(d => (d[1] >> SIG_QOS_OFFSET) & SIG_QOS_MASK);
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
