import { Instance, SnapshotIn, types } from 'mobx-state-tree';
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

export default Tile;
export interface ITile extends Instance<typeof Tile> {}
export interface ITileSnapshot extends SnapshotIn<typeof Tile> {}
