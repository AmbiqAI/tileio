import { Instance, SnapshotIn, types, flow, applySnapshot, destroy, getSnapshot, clone } from 'mobx-state-tree';
import { matchPath } from 'react-router';
import DeviceInfo, { DefaultDeviceInfo, IDeviceInfoSnapshot } from './deviceInfo';
import { formatDurationHMS, JsonStringDate, uuid4 } from '../utils';
import { RecordData } from '../db/record';
import {createRecordData, deleteRecordData} from '../db';
import { Notifier } from '../api';
import { Slot } from './slot';
import { EventMarker, IEventMarkerSnapshot, IEventMarker } from './event';
import DashboardSettings, { DefaultDashboardSettings, IDashboardSettings } from './dashboardSettings';

export enum RecordFormat {
  Sqlite = "SQLITE",
  Csv = "CSV"
}

const Record = types
  .model('Record', {
    id: types.optional(types.string, (): string => uuid4()),
    date: types.optional(JsonStringDate, () => new Date()),
    duration: types.optional(types.number, (): number => 0),
    device: DeviceInfo,
    settings: types.optional(DashboardSettings, DefaultDashboardSettings),
    slots: types.optional(types.array(Slot), []),
  })
  .volatile(self => ({
    db: undefined as (undefined | RecordData),
    recording: false,
    subscriptions: [] as {id: string, cb: (signals: number[][]) => void}[]
  }))
  .views(self => ({
    get path() { return `/records/${self.id}`; },
    get shortId() { return self.id.substring(0, 7); },
    get durationHMS() { return formatDurationHMS(self.duration); },
    get isOpen() { return !!self.db; }
  }))
  .views(self => ({
    isViewing(pathname: string) { return (matchPath(pathname, { path: self.path }) != null); }
  }))
  .actions(self => ({
    updateDuration: function(date?: number) {
      const refDate = date || Date.now();
      self.duration = Math.floor((refDate - self.date.valueOf())/1000);
    },
    _openDB: flow(function*() {
      if (self.db === undefined) {
        self.db = yield createRecordData(self.id, self.device);
        yield self.db!.open();
      }
      return self.db!;
    }),
    _closeDB: flow(function*() {
      if (self.db) {
        yield self.db!.close();
      }
      self.db = undefined;
    }),
    pruneData: function() {
      const oldestTs = Date.now() - 1000*(5+self.settings.duration);
      self.slots.forEach(slot => slot.prune(oldestTs));
    },
  }))
  .actions(self => ({
    setDeviceInfo: flow(function*(info: IDeviceInfoSnapshot) {
      if (info == null) { return; }
      applySnapshot(self.device, info);
      const db: RecordData = yield self._openDB();
      yield db.setDeviceInfo(self.device);
    }),
    setSettings: function(settings: IDashboardSettings) {
      applySnapshot(self.settings, getSnapshot(clone(settings)));
    },
    subscribe: function(id: string, cb: (signals: number[][]) => void) {
      console.log(`RECORD subscribed by ${id}`);
      self.subscriptions.push({id, cb});
    },
    unsubscribe: function(id: string) {
      console.log(`RECORD unsubscribed by ${id}`);
      const sIdx = self.subscriptions.findIndex(s => s.id === id);
      if (sIdx >= 0) { self.subscriptions.splice(sIdx, 1); }
    },
    addSlotData: flow(function*(slot: number, signals: number[][], mask: number[][]) {
      self.slots[slot].add(signals, mask);
      if (self.db) {
        yield self.db.addSlotSignals(slot, signals);
        yield self.db.addSlotMask(slot, mask);
      }
      self.pruneData();  // Might want to throttle
      self.updateDuration();
      for (const subscription of self.subscriptions) { subscription.cb(signals); }
    }),
    addSlotMetrics: flow(function*(slot: number, metrics: number[][]) {
      self.slots[slot].metrics.add(metrics);
      if (self.db) {
        yield self.db.addSlotMetrics(slot, metrics);
      }
      self.pruneData();  // Might want to throttle
      self.updateDuration();
    }),
    addEvent: flow(function*(name?: string) {
      if (self.db) {
        const eventName = name || `Event ${yield self.db.getEventsLength()}`;
        yield self.db.addEvent(EventMarker.create({name: eventName}));
        Notifier.add({
          message: 'Event marker added',
          options: { variant: 'success' }
        });
      }
    }),
    getEvents: flow(function*(start?: number, stop?: number) {
      const db: RecordData = yield self._openDB();
      const snapshots: IEventMarkerSnapshot[] = yield db.getEvents(start, stop);
      const events = snapshots.filter(e => !!e && e.ts && e.name).map(e => EventMarker.create(e));
      return events;
    }),
    setEvents: flow(function*(events: IEventMarker[]) {
      const db: RecordData = yield self._openDB();
      yield db.setEvents(events);
    }),
    getSlotSignals: flow(function*(slot: number, start?: number, stop?: number) {
      const db: RecordData = yield self._openDB();
      const signals: number[][] = yield db.getSlotSignals(slot, start, stop);
      return signals;
    }),
    getSlotSignalsLength: flow(function*(slot: number) {
      const db: RecordData = yield self._openDB();
      return yield db.getSlotSignalsLength(slot);
    }),
    getSlotMask: flow(function*(slot: number, start?: number, stop?: number) {
      const db: RecordData = yield self._openDB();
      const signals: number[][] = yield db.getSlotMask(slot, start, stop);
      return signals;
    }),
    getSlotMaskLength: flow(function*(slot: number) {
      const db: RecordData = yield self._openDB();
      return yield db.getSlotMaskLength(slot);
    }),
    getSlotMetrics: flow(function*(slot: number, start?: number, stop?: number) {
      const db: RecordData = yield self._openDB();
      const metrics: number[][] = yield db.getSlotMetrics(slot, start, stop);
      return metrics;
    }),
    getSlotMetricsLength: flow(function*(slot: number) {
      const db: RecordData = yield self._openDB();
      return yield db.getSlotMetricsLength(slot);
    }),
    generateRecordUri: flow(function*(format: RecordFormat){
      const db: RecordData = yield self._openDB();
      return yield db.generateUri(self.date, self.duration, self.device, format);
    }),
    delete: flow(function*() {
      try {
        yield deleteRecordData(self.id);
      } catch(error) {
        console.error(`Failed deleting record ${error}`);
        Notifier.add({
          message: `Failed deleting record (${error})`,
          options: { variant: 'error' }
        });
      }
      destroy(self);
    }),
    reset: function() {
      self.date = new Date();
      self.duration = 0;
    },
    clear: function() {
      for (const slot of self.slots) {
        slot.clear();
      }
    },
    open: flow(function*(){
      yield self._openDB();
    }),
    close: flow(function*(){
      yield self._closeDB();
    })
  }))
  .actions(self => ({
    startRecording: flow(function*() {
      yield self._openDB();
      self.reset();
      self.clear();
      self.recording = true;
    }),
    stopRecording: flow(function*(save?: boolean) {
      self.clear();
      if (self.db) {
        yield self.db!.close();
        self.db = undefined;
      }
      self.recording = false;
    }),
  }))
  .actions(self => ({
    afterCreate() {
    },
    beforeDestroy() {
    }
  }));
export default Record;
export interface IRecord extends Instance<typeof Record> {}
export interface IRecordSnapshot extends SnapshotIn<typeof Record> {}


export const NotFoundRecord = (id: string) => Record.create({
  id: id,
  device: DefaultDeviceInfo(id),
})
