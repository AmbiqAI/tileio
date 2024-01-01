import { flow, Instance, types, } from 'mobx-state-tree';
import Device, { IDevice, IDeviceSnapshot, NewDevice } from './device';
import Record, { IRecordSnapshot } from './record';
import bleManager, { Notifier } from '../api';
import { delay } from '../utils';
import Settings from './settings';
import { closeDB, initDB } from '../db';

export const Root = types
.model('Root', {
  devices: types.array(Device),
  records: types.array(Record),
  settings: Settings
})
.volatile(self => ({
  availableDevices: ([] as IDevice[]),
  fetching: false,
}))
.views(self => ({
  recordById(targetId: string) {
    return self.records.find(({ id }) => id === targetId);
  },
  deviceById(targetId: string) {
    return self.devices.find(({ id }) => id === targetId);
  },
  availableDeviceById(targetId: string) {
    return self.availableDevices.find(({ id }) => id === targetId);
  },
  removeAvailableDevice: function(deviceId: string) {
    const dIdx = self.availableDevices.findIndex(d => d.id === deviceId);
    if (dIdx >= 0) { self.availableDevices.splice(dIdx, 1); }
  }
}))
.actions(self => ({
  addAvailableDevice(deviceId: string, name: string) {
    if (!self.deviceById(deviceId)) {
      const device = NewDevice(deviceId, name);
      device.setOnline(true);
      self.availableDevices = [device, ...self.availableDevices];
    }
  }
}))
.actions(self => ({
  refreshDevices: flow(function *() {
    if (self.fetching) { return; }
    try {
      self.fetching = true;
      const deviceIds: string[] = [];
      yield bleManager.refreshPreviousDevices(self.devices.map(d => d.id), (deviceId: string, name: string) => {
        deviceIds.push(deviceId);
        self.deviceById(deviceId)?.setOnline(true);
      });
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
      yield bleManager.startScan((deviceId: string, name: string) => {
        self.addAvailableDevice(deviceId, name);
        return false;
      });
      yield delay(4000);
      yield bleManager.stopScan();
    } catch (error) {
      Notifier.add({ message: `Failed fetching devices: (${error})`, options: { variant: 'error' }});
    } finally {
      self.fetching = false;
    }
  }),
  addDevice(device: IDeviceSnapshot) {
    const existingDevice = self.deviceById(device.id);
    if (!existingDevice){
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
  }
}));

export interface IRoot extends Instance<typeof Root> {}
