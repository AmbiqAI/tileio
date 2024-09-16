import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { ISlotConfigSnapshot, SlotConfig, SlotConfigSchema } from "./slot";
import { UioConfig, UioConfigSchema } from "./uioState";
import { applySnapshot, cast, Instance, SnapshotIn, types } from "mobx-state-tree";
import { cloneDeep } from "lodash";


export const DeviceConfigSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    type: 'object',
    required: ['slots', 'uio'],
    properties: {
      slots: {
        type: 'array',
        minItems: 4,
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


const DeviceConfig = types
.model('DeviceConfig', {
  slots: types.optional(types.array(SlotConfig), [{name: 's0'}, {name: 's1'}, {name: 's2'}, {name: 's3'}]),
  uio: types.optional(UioConfig, {}),
})
.actions(self => ({
  setSlots: function(slots: ISlotConfigSnapshot[]) {
    if (slots == null) { return; }
    self.slots = cast(slots);
  },
  copyFrom: function(info: any) {
    applySnapshot(self, cloneDeep(info));
  }
}));


export default DeviceConfig;
export type IDeviceConfig = Instance<typeof DeviceConfig>;
export type IDeviceConfigSnapshot = SnapshotIn<typeof DeviceConfig>;
