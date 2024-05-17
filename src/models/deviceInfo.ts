import { Instance, SnapshotIn, applySnapshot, cast, types } from 'mobx-state-tree';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { JsonStringDate } from '../utils';
import { ISlotConfigSnapshot, SlotConfig, SlotConfigSchema } from './slot';
import { UioConfigSchema, UioConfig } from './uioState';
import { cloneDeep } from 'lodash';
import { DeviceInterface, DeviceInterfaceType } from './types';


export const DeviceInfoSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    type: 'object',
    required: ['name', 'location', 'slots'],
    properties: {
      name: {
        type: 'string',
        default: 'Name'
      },
      location: {
        type: 'string',
        default: 'Location'
      },
      slots: {
        type: 'array',
        minItems: 1,
        maxItems: 4,
        items: SlotConfigSchema.schema,
        description: 'Slots',
      },
      uio: UioConfigSchema.schema
    }
  },
  uischema: {
    slots: {
      items: SlotConfigSchema.uischema
    },
    uio: UioConfigSchema.uischema
  }
};

const DeviceInfo = types
.model('DeviceInfo', {
  id: types.string,
  name: types.optional(types.string, 'Name'),
  location: types.optional(types.string, 'Location'),
  type: types.optional(DeviceInterface, DeviceInterfaceType.ble),
  slots: types.optional(types.array(SlotConfig), [{name: 's0'}, {name: 's1'}, {name: 's2'}, {name: 's3'}]),
  uio: types.optional(UioConfig, {}),
  lastSeenDate: types.optional(JsonStringDate, new Date()),
})
.views(self => ({
  get shortId() {
    return self.id.substring(0, 7);
  }
}))
.actions(self => ({
  setName: function(name: string) {
    if (name == null) { return; }
    self.name = name.slice(0, 20);
  },
  setLocation: function(location: string) {
    if (location == null) { return; }
    self.location = location.slice(0, 20);
  },
  setLastSeenDate: function(date: Date) {
    if (date == null) { return; }
    self.lastSeenDate = date;
  },
  setSlots: function(slots: ISlotConfigSnapshot[]) {
    if (slots == null) { return; }
    self.slots = cast(slots);
  },
  copyFrom: function(info: any) {
    const id = self.id;
    applySnapshot(self, cloneDeep(info));
    self.id = id;
  }
}));

export default DeviceInfo;
export interface IDeviceInfo extends Instance<typeof DeviceInfo> {}
export interface IDeviceInfoSnapshot extends SnapshotIn<typeof DeviceInfo> {}

export const DefaultDeviceInfo = (id: string) => DeviceInfo.create({
  id: id, name: 'Device', location: 'Location'
});
