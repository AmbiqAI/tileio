import { flow, Instance, types } from 'mobx-state-tree';
import Device, { IDevice, IDeviceSnapshot, NewDevice } from './device';
import Record, { IRecord, IRecordSnapshot } from './record';
import ApiManager, { Notifier } from '../api';
import Settings from './settings';
import { closeDB, initDB } from '../db';
import { DeviceInterfaceType } from './types';

export const Root = types
.model('Root', {
  settings: Settings,
  devices: types.array(Device),
  records: types.array(Record),
})
.volatile(self => ({
  availableDevices: ([] as IDevice[]),
  fetching: false,
}))
.views(self => ({
  recordById(targetId: string): IRecord|undefined {
    return self.records.find(({ id }) => id === targetId);
  },
  deviceById(targetId: string): IDevice|undefined {
    return self.devices.find(({ id }) => id === targetId);
  },
  availableDeviceById(targetId: string): IDevice|undefined {
    return self.availableDevices.find(({ id }) => id === targetId);
  },
}))
.actions(self => ({
  addAvailableDevice(deviceId: string, name: string, type: DeviceInterfaceType) {
    if (!self.deviceById(deviceId)) {
      const device = NewDevice(deviceId, {id: deviceId, name: name, type: type});
      device.setOnline(true);
      self.availableDevices = [device, ...self.availableDevices];
    }
  },
  removeAvailableDevice: function(deviceId: string) {
    const dIdx = self.availableDevices.findIndex(d => d.id === deviceId);
    if (dIdx >= 0) { self.availableDevices.splice(dIdx, 1); }
  }
}))
.actions(self => ({
  refreshDevices: flow(function *() {
    if (self.fetching) { return; }
    try {
      self.fetching = true;
      const deviceIds: string[] = [];
      yield ApiManager.refreshPreviousDevices(self.devices.map(d => d.info), (deviceId: string, _name: string) => {
        deviceIds.push(deviceId);
        self.deviceById(deviceId)?.setOnline(true);
      });
      // Mark offline those not connected or not discovered
      self.devices.forEach(device => {
        device.setOnline(device.state.connected || deviceIds.includes(device.id));
      });
    } catch (error) {
      Notifier.add({ message: `Failed fetching devices (${error})`, options: { variant: 'error' }});
    } finally {
      self.fetching = false;
    }
  }),
  fetchDevices: flow(function*() {
    if (self.fetching) { return; }
    try {
      self.fetching = true;
      self.availableDevices.splice(0, self.availableDevices.length);
      yield ApiManager.scan((deviceId: string, name: string, type: DeviceInterfaceType) => {
        self.addAvailableDevice(deviceId, name, type);
        return false;
      }, 5000);
    } catch (error) {
      Notifier.add({ message: `Failed fetching devices: (${error})`, options: { variant: 'error' }});
    } finally {
      self.fetching = false;
    }
  }),
  addDevice(device: IDeviceSnapshot) {
    if (!self.deviceById(device.id)){
      self.devices.push(device);
      self.removeAvailableDevice(device.id);
    }
  },
  removeDevice: flow(function*(deviceId: string) {
    const device = self.deviceById(deviceId);
    if (device) { yield device.delete(); }
  }),
  removeAllDevices: flow(function*() {
    const deviceIds = self.devices.map(d => d.id);
    for (const deviceId of deviceIds) {
      const device = self.deviceById(deviceId);
      if (device) { yield device.delete(); }
    }
    Notifier.add({ message: 'Removed all devices' });
  }),
  addRecord(record: IRecordSnapshot) {
    const existingRecord = self.recordById(record.id as string);
    if (!existingRecord){
      self.records.push(record);
    }
  },
  removeRecord: flow(function*(recordId: string) {
    const record = self.recordById(recordId);
    if (record) { yield record.delete(); }
  }),
  removeAllRecords: flow(function*() {
    const recordIds = self.records.map(r => r.id);
    for (const recordId of recordIds) {
      const record = self.recordById(recordId);
      if (record) { yield record.delete(); }
    }
    Notifier.add({ message: `Removed all records` });
  }),
  clearRecords() {
  },
}))
.actions(self => ({
  afterCreate() {
    initDB();
  },
  beforeDestroy() {
    closeDB();
  },
  initialize: function() {
    ApiManager.initialize(self.settings.apiMode);
  },
}));

export interface IRoot extends Instance<typeof Root> {}
