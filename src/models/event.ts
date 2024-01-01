import { Instance, SnapshotIn, types, destroy } from 'mobx-state-tree';


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
  add: function(event: IEventMarker) {
    if (self.events.findIndex(e => e.ts === event.ts) >= 0) {
      return;
    }
    let idx = self.events.findIndex((e) => event.ts < e.ts);
    if (idx === -1) { idx = self.events.length; }
    self.events.splice(idx, 0, event);
  },
  remove: function(ts: number) {
    const idx = self.events.findIndex(e => e.ts === ts);
    if (idx === -1) { return }
    self.events.splice(idx, 1);
  },
  delete: function() {
    destroy(self)
  }
}));

export interface IEventMarkerSet extends Instance<typeof EventMarkerSet> {}
export interface IEventMarkerSetSnapshot extends SnapshotIn<typeof EventMarkerSet> {}
