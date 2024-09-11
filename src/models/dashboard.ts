import { applySnapshot, cast, destroy, detach, flow, Instance, SnapshotIn, typecheck, types } from 'mobx-state-tree';
import { IRecord } from './record';
import { IUioConfigSnapshot } from './uioState';
import { ISlotConfigSnapshot } from './slot';
import Tile, { ITileSnapshot } from './tile';
import { cloneDeep } from 'lodash';
import DeviceConfig from './deviceConfig';
import { uuid4 } from '../utils';

const Dashboard = types
.model('Dashboard', {
  id: types.optional(types.string, uuid4()),
  name: types.optional(types.string, 'Dashboard'),
  description: types.optional(types.string, 'A Tileio dashboard'),
  duration: types.optional(types.number, 30),
  tiles: types.optional(types.array(Tile), []),
  device: types.optional(DeviceConfig, {}),
})
.volatile(self => ({
  record: undefined as (undefined | IRecord),
}))
.views(self => ({
  get path() {
    return `/dashboards/${encodeURIComponent(self.id)}`;
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
  get numActiveSlots() {
    return self.device.slots.filter(s => s.enabled).length;
  },
  get numActiveUio() {
    return self.device.uio.list.filter(io => io.enabled).length;
  }
}))
.actions(self => ({
  tileById(targetId: string) {
    return self.tiles.find(({ id }) => id === targetId);
  },
}))
.actions(self => ({
  setSlots: function(slots: ISlotConfigSnapshot[]) {
    if (slots == null) { return; }
    self.device.slots = cast(slots);
  },
  setTiles: function(tiles: ITileSnapshot[]) {
    try {
      typecheck(types.array(Tile), tiles);
    } catch (e) {
      console.error(e);
    }
  },
  setUio: function(uio: IUioConfigSnapshot) {
    self.device.uio = cast(uio);
  },
  // updateTileLayout: function(layouts: GridLayout[]) {
  //   for (const layout of layouts) {
  //     const tile = self.tileById(layout.i);
  //     if (tile) {
  //       console.log(`Updating tile ${tile.id} ${tile.config.name} layout`);
  //       tile.setGrid(layout);
  //     }
  //   }
  // },
  moveTileToIndex: function(id: string, index: number) {
    const stepIdx = self.tiles.findIndex(l => l.id === id);
    if (index < 0 || index >= self.tiles.length || stepIdx === index) {
      return;
    }
    const step = detach(self.tiles[stepIdx]);
    self.tiles.splice(index, 0, step);
  },
  removeTile: function(index: number) {
    if (index < 0 || index >= self.tiles.length) {
      return;
    }
    self.tiles.splice(index, 1);
  },
  addTile: function(index: number, layout: ITileSnapshot) {
    if (index === -1) {
      self.tiles.push(layout);
    } else {
    self.tiles.splice(index, 0, layout);
    }
  },
  setName: function(name: string) {
    self.name = name;
  },
  setDescription: function(description: string) {
    self.description = description;
  },
  setDuration: function(duration: number) {
    self.duration = Math.max(Math.min(duration, 120), 5);
  },
  copyFrom: function(other: IDashboardSnapshot) {
    const id = self.id;
    applySnapshot(self, cloneDeep(other));
    self.id = id;
  },
}))
.actions(self => ({
  delete: flow(function*() {
    destroy(self);
  }),
}))

export default Dashboard;
export interface IDashboard extends Instance<typeof Dashboard> {}
export interface IDashboardSnapshot extends SnapshotIn<typeof Dashboard> {}
