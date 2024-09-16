import { flow, Instance, types } from 'mobx-state-tree';
import Device, { IDevice } from './device';
import Dashboard, { IDashboard, IDashboardSnapshot } from './dashboard';
import Record, { IRecord, IRecordSnapshot } from './record';
import { Notifier } from '../api';
import Settings from './settings';
import { closeDB, initDB } from '../db';
import Backend from './backend';

export const Root = types
.model('Root', {
  settings: Settings,
  dashboards: types.array(Dashboard),
  records: types.array(Record),
  backend: types.optional(Backend, {}),
  device: types.maybeNull(Device)
})
.volatile(self => ({
  initialized: false,
  record: (undefined as IRecord|undefined),
}))
.views(self => ({
  recordById(targetId: string): IRecord|undefined {
    return self.records.find(({ id }) => id === targetId);
  },
  dashboardById(targetId: string): IDashboard|undefined {
    return self.dashboards.find(({ id }) => id === targetId);
  },
}))
.actions(self => ({
  addDashboard(dashboard: IDashboardSnapshot) {
      if (!self.dashboardById(dashboard.id!)){
        const newDashboard = Dashboard.create(dashboard);
        self.dashboards.push(newDashboard);
      }
  },
  removeDashboard: flow(function*(dasboardId: string) {
    const dashboard = self.dashboardById(dasboardId);
    if (dashboard) { yield dashboard.delete(); }
  }),
  removeAllDashboards: flow(function*() {
    const dashboardIds = self.dashboards.map(d => d.id);
    for (const dashboardId of dashboardIds) {
      const dashboard = self.dashboardById(dashboardId);
      if (dashboard) { yield dashboard.delete(); }
    }
    Notifier.add({ message: 'Removed all dashboards' });
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
  setActiveDevice: flow(function*(deviceId: string) {
    if (self.device) {
      yield self.device.delete();
    }
    self.device = null;
    const device = self.backend.deviceById(deviceId);
    if (device) {
      self.device = device;
    }
  }),
  clearActiveDevice: flow(function*() {
    try {
      if (self.device) {
        yield self.device.delete();
      }
    } catch (error) {
      console.error(`Failed disconnecting from ${self.device?.name}. (${error})`);
    }
    self.device = null;
  })

}))
.actions(self => ({
  afterCreate() {
    console.debug('root.afterCreate');
    initDB();
  },
  beforeDestroy() {
    console.debug('root.beforeDestroy');
    closeDB();
  },
  initialize: function() {
    console.debug('Initializing root store');
    self.backend.initialize(self.settings.apiMode);
    self.initialized = true;
  },
}));

export interface IRoot extends Instance<typeof Root> {}
