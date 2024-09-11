import { Instance, SnapshotIn, types } from 'mobx-state-tree';
import { DeviceInterface, DeviceInterfaceType } from './types';


const DeviceInfo = types
.model('DeviceInfo', {
  id: types.string,
  name: types.optional(types.string, 'Name'),
  type: types.optional(DeviceInterface, DeviceInterfaceType.ble),
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
  }
}));

export default DeviceInfo;
export interface IDeviceInfo extends Instance<typeof DeviceInfo> {}
export interface IDeviceInfoSnapshot extends SnapshotIn<typeof DeviceInfo> {}

export const DefaultDeviceInfo = (id: string) => DeviceInfo.create({
  id: id, name: 'Device'
});
