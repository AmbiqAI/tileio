import { detach, Instance, SnapshotIn, types, typecheck } from 'mobx-state-tree';
import { uuid4 } from '../utils';
import { DeviceLayoutSize, LayoutSizeType } from './types';
import { Layout as GridLayout } from 'react-grid-layout';


export const Tile = types
.model('Tile', {
  id: types.optional(types.string, uuid4),
  name: types.optional(types.string, ''),
  type: types.optional(types.string, ''),
  size: types.optional(DeviceLayoutSize, LayoutSizeType.sm),
  visible: types.optional(types.boolean, true),
  config: types.optional(types.frozen<{ [key: string]: any}>(), {}),
  grid: types.optional(types.frozen<{ [key: string]: any}>(), {x: 0, y: 0, w: 1, h: 1})
})
.actions(self => ({
  setVisible: function(visible?: boolean) {
    if (visible === undefined) {
      self.visible = !self.visible;
    } else {
      self.visible = visible;
    }
  },
  setSize: function(size: LayoutSizeType) {
    self.size = size;
  },
  setConfig: function(config: { [key: string]: any}) {
    self.config = config;
  },
  setGrid: function(layout: GridLayout) {
    if (layout.x !== self.grid.x || layout.y !== self.grid.y || layout.w !== self.grid.w || layout.h !== self.grid.h) {
      self.grid = layout;
    }
  }
}))
export interface ITile extends Instance<typeof Tile> {}
export interface ITileSnapshot extends SnapshotIn<typeof Tile> {}


const DashboardSettings = types
.model('DashboardSettings', {
  streaming: types.optional(types.boolean, true),
  duration: types.optional(types.number, 30),
  tiles: types.optional(types.array(Tile), [])
})
.views(self => ({
}))
.actions(self => ({
  tileById(targetId: string) {
    return self.tiles.find(({ id }) => id === targetId);
  },
}))
.actions(self => ({
  setTiles: function(tiles: ITileSnapshot[]) {
    try {
      console.log(tiles);
      typecheck(types.array(Tile), tiles);
    } catch (e) {
      console.error(e);
    }
  },
  updateTileLayout: function(layouts: GridLayout[]) {
    for (const layout of layouts) {
      const tile = self.tileById(layout.i);
      if (tile) {
        console.log(`Updating tile ${tile.id} ${tile.config.name} layout`);
        tile.setGrid(layout);
      }
    }
  },
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
  setDuration: function(duration: number) {
    self.duration = Math.max(Math.min(duration, 120), 5);
  },
  setStreaming: function(enable: boolean) {
    self.streaming = enable;
  }
}))

 export default DashboardSettings;
 export interface IDashboardSettings extends Instance<typeof DashboardSettings> {}
 export interface IDashboardSettingsSnapshot extends SnapshotIn<typeof DashboardSettings> {}

export const DefaultDeviceTiles = () => ([
] as ITileSnapshot[]);


export const DefaultDashboardSettings = () => DashboardSettings.create({
  tiles: DefaultDeviceTiles()
});
