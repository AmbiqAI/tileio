import { flow, getParentOfType, hasParentOfType, Instance, types } from "mobx-state-tree";
import { DeviceInterfaceType } from "./types";
import Device, { IDevice } from "./device";
import ApiManager, { Notifier } from '../api';
import { ApiModeType } from "../api/types";
import { IRoot, Root } from "./root";


const Backend = types
.model('Backend', {

})
.volatile(self => ({
  interface: DeviceInterfaceType.ble as DeviceInterfaceType,
  availableInterfaces: [] as DeviceInterfaceType[],
  availableDevices: [] as IDevice[],
  fetching: false,
}))
.views(self => ({
  deviceById(targetId: string): IDevice|undefined {
    return self.availableDevices.find(({ id }) => id === targetId);
  },
}))
.actions(self => ({
  addAvailableDevice(deviceId: string, name: string, type: DeviceInterfaceType) {
    const device = Device.create({ id: deviceId, name: name, type: type });
    device.setOnline(true);
    self.availableDevices = [device, ...self.availableDevices];
  },
  removeAvailableDevice: function(deviceId: string) {
    const dIdx = self.availableDevices.findIndex(d => d.id === deviceId);
    if (dIdx >= 0) { self.availableDevices.splice(dIdx, 1); }
  },
  clearAvailableDevices: function() {
    self.availableDevices.splice(0, self.availableDevices.length);
  }
}))
.actions(self => ({
  setInterface: function(interfaceType: DeviceInterfaceType) {
    if (hasParentOfType(self, Root) === false) { return; }
    const parent = getParentOfType(self, Root) as IRoot;
    if (parent.device){ return; }
    if (self.interface === interfaceType) { return; }
    self.interface = interfaceType;
    self.clearAvailableDevices();
  },
  setAvailableInterfaces: function(interfaces: DeviceInterfaceType[]) {
    self.availableInterfaces.splice(0, self.availableInterfaces.length);
    self.availableInterfaces.push(...interfaces);
  },
  fetchDevices: flow(function*() {
    /* Fetch online devices from the backend */
    if (self.fetching) { return; }
    try {
      self.fetching = true;
      self.availableDevices.splice(0, self.availableDevices.length);
      yield ApiManager.scan(self.interface, (deviceId: string, name: string, type: DeviceInterfaceType) => {
        self.addAvailableDevice(deviceId, name, type);
        return false;
      }, 5000);
    } catch (error) {
      Notifier.add({ message: `Failed fetching devices: (${error})`, options: { variant: 'error' }});
    } finally {
      self.fetching = false;
    }
  }),
}))
.actions(self => ({
  clear: function() {
    self.interface = DeviceInterfaceType.ble;
    self.clearAvailableDevices();
  },
  initialize: function(apiMode: ApiModeType) {
    ApiManager.initialize(apiMode).then(() => {
      console.log('Initialized root store');
      self.setAvailableInterfaces(ApiManager.getAvailableInterfaces());
    });
  }
}));

export default Backend;
export interface IBackend extends Instance<typeof Backend> {}
export interface IBackendSnapshot extends Instance<typeof Backend> {}
