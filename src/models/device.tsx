import { flow } from 'mobx';
import { matchPath } from 'react-router';
import { applySnapshot, cast, clone, destroy, getParentOfType, getSnapshot, Instance, SnapshotIn, types } from 'mobx-state-tree';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ViewRecordIcon from '@mui/icons-material/LaunchRounded';
import DeviceInfo, { DefaultDeviceInfo, IDeviceInfo } from './deviceInfo';
import bleManager, { Notifier } from '../api';
import Record, { IRecord } from './record';
import { delay } from '../utils';
import { IRoot, Root } from './root';
import DeviceState, { DeviceConnectionType } from './deviceState';
import DashboardSettings, { IDashboardSettings } from './dashboardSettings';
import { Slot } from './slot';
import { UioState } from './uioState';

const Device = types
.model('Device', {
  id: types.string,
  info: DeviceInfo,
  settings: types.optional(DashboardSettings, {}),
  state: types.optional(DeviceState, {}),
  slots: types.optional(types.array(Slot), [{}, {}, {}, {}]),
  uioState: types.optional(UioState, {}),
})
.volatile(self => ({
  record: undefined as (undefined | IRecord),
  notifications: false,
  polling: undefined as (undefined | NodeJS.Timeout)
}))
.views(self => ({
  get path() {
    return `/devices/${encodeURIComponent(self.id)}`;
  },
  get shortId() {
    return self.id.substring(0, 7);
  },
  get recording(): boolean {
    return !!self.record;
  },
  get recordDurationStr(): string {
    return self.record ? self.record.durationHMS : '--:--';
  },
  get seenDate(): Date|undefined {
    return self.info.lastSeenDate;
  }
}))
.actions(self => ({
  pruneData: function() {
    const oldestTs = Date.now() - 1000*(5+self.settings.duration);
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
    if (online) {
      self.info.lastSeenDate = new Date();
    }
  }
}))
.actions(self => ({
  fetchSignalStrength: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      self.state.setSignalStrength(yield bleManager.getDeviceStrength(self.id));
    } catch(error) {
      console.error(`Failed fetching RSSI: ${error}`);
    }
  }),
  fetchBatterylevel: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      self.state.setBatteryLevel(yield bleManager.getDeviceBatteryLevel(self.id));
    } catch(error) {
      console.error(`Failed reading battery level: ${error}`);
    }
  }),
  fetchUioState: flow(function*() {
    try {
      if (!self.state.connected) { return; }
      self.uioState.setState(yield bleManager.getUioState(self.id));
    } catch(error) {
      console.error(`Failed reading UIO state: ${error}`);
    }
  }),
  setUioButton: flow(function*(button: number, state: boolean) {
    if (self.state.disconnected) { return; }
    self.uioState.setButtonState(button, state);
    yield bleManager.setUioState(self.id, self.uioState.state);
  }),
  fetchInfo: flow(function*() {
    yield delay(1);
  }),
  setInfo: function(info: IDeviceInfo) {
    try {
      applySnapshot(self.info, info);
      self.info.id = self.id;
    } catch(error) {
      console.error(`Failed updating device ${self.id} info}`, error);
    }
  },
  setSettings: function(settings: IDashboardSettings) {
    applySnapshot(self.settings, getSnapshot(clone(settings)));
  }
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
    for (let slot = 0; slot < self.info.slots.length; slot++) {
      yield bleManager.enableSlotMetricsNotifications(self.id, slot, self.receivedSlotMetrics);
    }
    self.polling = setInterval(self.fetchUpdates, 2500);
  }),
  stopPolling: flow(function*(){
    if (self.polling) {
      clearInterval(self.polling);
      self.polling = undefined;
    }
    for (let slot = 0; slot < self.info.slots.length; slot++) {
      yield bleManager.disableSlotMetricsNotifications(self.id, slot);
    }
  }),
}))
.actions(self => ({
  setNotifications: flow(function*(enable?: boolean) {
    if (enable === undefined) {
      enable = !self.notifications;
    }
    if (self.state.disconnected || self.notifications === enable) { return; }
    for (let slot = 0; slot < self.info.slots.length; slot++) {
      if (enable) {
        yield bleManager.enableSlotNotifications(self.id, slot, self.receivedSlotData);
      } else {
        yield bleManager.disableSlotNotifications(self.id, slot);
      }
    }
    self.notifications = enable;
  }),
  startRecording: flow(function*() {
    if (self.recording) { return; }
    const record = Record.create({
      device: clone(self.info),
      slots: self.slots.map(slot => ({})),
      settings: clone(self.settings),
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
  connect: flow(function*() {
    try {
      self.slots.forEach(slot => slot.clear());
      self.state.setConnectionState(DeviceConnectionType.CONNECTING);
      yield bleManager.deviceConnect(self.id, self.info, self.onDisconnected);
      self.state.setConnectionState(DeviceConnectionType.CONNECTED);
      yield delay(500);
      yield self.fetchUioState();
      yield self.fetchInfo();
      yield self.startPolling();
      yield self.setNotifications(self.settings.streaming);
    } catch (error) {
      console.error(error);
      Notifier.add({
        message: `Failed connecting to ${self.shortId}. (${error})`,
        options: { variant: 'error' },
      });
      self.state.setConnectionState(DeviceConnectionType.DISCONNECTED);
    }
  }),
  refresh: flow(function*() {
    try {
      // If not connected, refresh online state
      if (self.state.disconnected && !self.state.online) {
        const available = yield bleManager.refreshPreviousDevice(self.id);
        self.setOnline(available);
      // If connected, refresh device info
      } else if (self.state.connected) {
        yield self.fetchInfo();
      }
    } catch (error) {
    }
  }),
  disconnect: flow(function*() {
    if (self.state.connected) {
      self.state.setConnectionState(DeviceConnectionType.DISCONNECTING);
      yield self.setNotifications(false);
      yield self.stopPolling();
      yield self.stopRecording();
      yield bleManager.deviceDisconnect(self.id);
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
.views(self => ({
  isViewing(pathname: string) {
    return (matchPath(pathname, { path: self.path}) != null);
  }
}))
.actions(self => ({
  afterCreate: function() {
    self.state.reset();
    self.slots = cast(self.info.slots.map((slot, idx) => Slot.create({
    })));
  }
}));

export const NotFoundDevice = (id: string) => Device.create({
  id: id,
  info: DefaultDeviceInfo(id),
});

export const NewDevice = (id: string, name: string) => Device.create({
  id: id,
  info: {
    id: id,
    name: name,
    location: 'loc',
  },
  slots: [],
});

export default Device;
export interface IDevice extends Instance<typeof Device> {}
export interface IDeviceSnapshot extends SnapshotIn<typeof Device> {}
