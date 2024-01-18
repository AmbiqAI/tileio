import { Instance, SnapshotIn, types, destroy } from 'mobx-state-tree';
import { binarySearch } from '../components/Tiles/utils';


export const EventMarker = types
.model('EventMarker', {
  ts: types.optional(types.number, () => Date.now()),
  name: types.optional(types.string, '')
})
.views(self => ({
  get formattedTime() {
    return new Date(self.ts).toLocaleString();
  }
}))
.actions(self => ({
  setTs: function(ts: Date | number | null) {
    if (ts == null) { return; }
    if (typeof ts === 'number') {
      self.ts = ts;
    } else {
      self.ts = ts.valueOf();
    }
  },
  setName: function(name: string) {
    self.name = name;
  },
  delete: function() {
    destroy(self)
  }
}));

export interface IEventMarker extends Instance<typeof EventMarker> {}
export interface IEventMarkerSnapshot extends SnapshotIn<typeof EventMarker> {}

export const EventMarkerSet = types
.model('EventMarkerSet', {
  events: types.array(EventMarker),
})
.views(self => ({
  get length() {
    return self.events.length;
  },
}))
.actions(self => ({
  findEventByTs: function(ts: number) {
    return self.events.findIndex(e => e.ts === ts);
  },
  findEventIndex: function(ts: number) {
    return binarySearch(self.events, ts, (a, b) => a - (b.ts ?? 0));
  }
}))
.actions(self => ({
  add: function(event: IEventMarker) {
    const idx = self.findEventIndex(event.ts);
    if (self.events[idx]?.ts !== event.ts) {
      self.events.splice(idx, 0, event);
    }
  },
  remove: function(ts: number) {
    const idx = self.findEventIndex(ts);
    if (idx === -1) { return }
    self.events.splice(idx, 1);
  },
  delete: function() {
    destroy(self)
  }
}));

export interface IEventMarkerSet extends Instance<typeof EventMarkerSet> {}
export interface IEventMarkerSetSnapshot extends SnapshotIn<typeof EventMarkerSet> {}
