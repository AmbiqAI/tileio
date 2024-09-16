import { flow, hasParentOfType } from 'mobx-state-tree';
import { cast, clone, destroy, getParentOfType, Instance, SnapshotIn, types } from 'mobx-state-tree';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ViewRecordIcon from '@mui/icons-material/LaunchRounded';
import ApiManager, { Notifier } from '../api';
import Record, { IRecord } from './record';
import { delay } from '../utils';
import { IRoot, Root } from './root';
import DeviceState, { DeviceConnectionType } from './deviceState';
import { Slot } from './slot';
import { UioState } from './uioState';
import { IDashboard } from './dashboard';
import { NUM_SLOTS } from '../components/constants';
import { DeviceInterface, DeviceInterfaceType } from './types';

const Device = types
.model('Device', {
  id: types.string,
  name: types.optional(types.string, 'Device'),
  type: types.optional(DeviceInterface, DeviceInterfaceType.ble),
  state: types.optional(DeviceState, {}),
  slots: types.optional(types.array(Slot), [{}, {}, {}, {}]),
  uioState: types.optional(UioState, {id: 'uioState'}),
})
.volatile(self => ({
  record: undefined as (undefined | IRecord),
  notifications: false,
  polling: undefined as (undefined | NodeJS.Timeout),
  dashboard: undefined as (undefined | IDashboard),
}))
.views(self => ({
  get shortId() {
    return self.id.substring(0, 7);
  },
  get recording(): boolean {
    return !!self.record;
  },
  get recordDurationStr(): string {
    return self.record ? self.record.durationHMS : '--:--';
  }
}))
.actions(self => ({
  pruneData: function() {
    if (self.dashboard === undefined) { return; }

    const oldestTs = Date.now() - 1000*(5+self.dashboard.duration);
    self.slots.forEach(slot => slot.prune(oldestTs));
  },
  receivedSlotData: flow(function*(slot: number, signals: number[][], mask: number[][]) {
    if (slot >= self.slots.length) { return; }
    self.slots[slot].add(signals, mask);
    if (self.record) {
      yield self.record.addSlotData(slot, signals, mask);
    }
  }),
  receivedSlotMetrics: flow(function*(slot: number, metrics: number[]) {
    if (slot >= self.slots.length) { return; }
    self.slots[slot].addMetrics([metrics]);
    if (self.record) {
      yield self.record.addSlotMetrics(slot, [metrics]);
    }
  }),
  setOnline: function(online: boolean) {
    self.state.setOnline(online);
  }
}))
.actions(self => ({
  fetchSignalStrength: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      const strength = yield ApiManager.getDeviceStrength(self.id);
      self.state.setSignalStrength(strength);
    } catch(error) {
      console.error(`Failed fetching RSSI: ${error}`);
    }
  }),
  fetchBatterylevel: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      const level = yield ApiManager.getDeviceBatteryLevel(self.id);
      self.state.setBatteryLevel(level);
    } catch(error) {
      console.error(`Failed reading battery level: ${error}`);
    }
  }),
  fetchUioState: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      yield self.uioState.fetchState();
    } catch(error) {
      console.error(`Failed reading UIO state: ${error}`);
    }
  }),
  setIoState: flow(function*(io: number, state: number) {
    if (self.state.disconnected) { return; }
    yield self.uioState.updateIoState(io, state);
  }),
  fetchInfo: flow(function*() {
    yield delay(1);
  }),

}))
.actions(self => ({
  fetchUpdates: flow(function*() {
    self.pruneData();
    yield self.fetchBatterylevel();
    yield self.fetchSignalStrength();
  })
}))
.actions(self => ({
  startPolling: flow(function*(){
    if (self.polling) {
      clearInterval(self.polling);
      self.polling = undefined;
    }
    self.polling = setInterval(self.fetchUpdates, 2500);
  }),
  stopPolling: flow(function*(){
    if (self.polling) {
      clearInterval(self.polling);
      self.polling = undefined;
    }
  }),
}))
.actions(self => ({
  setNotifications: flow(function*(enable?: boolean) {
    if (enable === undefined) {
      enable = !self.notifications;
    }
    if (self.state.disconnected) {
      return;
    }
    for (let slot = 0; slot < NUM_SLOTS; slot++) {
      if (enable) {
        yield ApiManager.enableSlotNotifications(self.id, slot, self.receivedSlotData);
        yield ApiManager.enableSlotMetricsNotifications(self.id, slot, self.receivedSlotMetrics);
      } else {
        yield ApiManager.disableSlotNotifications(self.id, slot);
        yield ApiManager.disableSlotMetricsNotifications(self.id, slot);
      }
      if (enable) {
        yield ApiManager.enableUioNotifications(self.id, self.uioState.updateState);
      } else {
        yield ApiManager.disableUioNotifications(self.id);
      }
    }
    self.notifications = enable;
  }),
  startRecording: flow(function*() {
    if (self.recording) { return; }
    if (!hasParentOfType(self, Root)) { return; }
    if (self.dashboard === undefined) {
      console.error('No dashboard set');
      return;
    }
    const record = Record.create({
      dashboard: clone(self.dashboard),
      slots: self.slots.map(slot => ({})),
    });
    yield record.startRecording();
    const parent = getParentOfType(self, Root) as IRoot;
    parent.addRecord(record);
    self.record = record;
    Notifier.add({ message: `Record ${self.record.shortId} started` });
  }),
  stopRecording: flow(function*(save?: boolean) {
    if (self.record) {
      const record = self.record;
      self.record = undefined;
      yield record.stopRecording();
      yield record.close();
      Notifier.add({
        message: `Record ${record.shortId} saved.`,
        options: {
          variant: 'success',
          action: (
            <strong>
              <IconButton component={RouterLink} to={`/records/${record.id}`}> <ViewRecordIcon /> </IconButton>
            </strong>
          )
        }
      });
    }
  }),
}))
.actions(self => ({
  onDisconnected: function(id: string) {
    self.state.setConnectionState(DeviceConnectionType.DISCONNECTED);
    new Promise<void>(async (resolve) => {
      await self.setNotifications(false);
      await self.stopPolling();
      await self.stopRecording();
      Notifier.add({ message: `Device ${self.shortId} disconnected` });
      resolve();
    });
  },
}))
.actions(self => ({
  connect: flow(function*(dashboard: IDashboard) {
    try {
      self.dashboard = dashboard;
      self.slots.forEach(slot => slot.clear());
      self.state.setConnectionState(DeviceConnectionType.CONNECTING);
      yield ApiManager.deviceConnect(self.id, self.dashboard.device.slots, self.onDisconnected);
      self.state.setConnectionState(DeviceConnectionType.CONNECTED);
      yield self.setNotifications(true);
      yield self.startPolling();
    } catch (error) {
      console.error(error);
      Notifier.add({
        message: `Failed connecting to ${self.shortId}. (${error})`,
        options: { variant: 'error' },
      });
      self.state.setConnectionState(DeviceConnectionType.DISCONNECTED);
      self.state.setOnline(false);
    }
  }),
  disconnect: flow(function*() {
    try {
      if (self.state.connected) {
        self.state.setConnectionState(DeviceConnectionType.DISCONNECTING);
        yield self.setNotifications(false);
        yield self.stopPolling();
        yield self.stopRecording();
        yield ApiManager.deviceDisconnect(self.id);
        self.state.setConnectionState(DeviceConnectionType.DISCONNECTED);
      }
    } catch (error) {
      console.error(`Failed disconnecting from ${self.shortId}. (${error})`);
      self.state.setConnectionState(DeviceConnectionType.DISCONNECTED);
    }
  }),
}))
.actions(self => ({
  delete: flow(function*() {
    try {
      console.debug(`Deleting device ${self.id}`);
      if (self.state.connected) {
        yield self.disconnect();
      }
      destroy(self);
    } catch(error) {
      Notifier.add({
        message: `Failed removing device ${self.id}`, options: { variant: 'error' },
      });
    }
  }),
}))
.actions(self => ({
  afterCreate: function() {
    self.slots = cast(Array.from({length: NUM_SLOTS}, (_, idx) => Slot.create({
    })));
    self.uioState.id = self.id;
  }
}));

export const NotFoundDevice = (id: string) => Device.create({
  id: id,
});

export default Device;
export interface IDevice extends Instance<typeof Device> {}
export interface IDeviceSnapshot extends SnapshotIn<typeof Device> {}
