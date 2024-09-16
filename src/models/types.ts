import { types } from 'mobx-state-tree';

export enum DeviceInterfaceType {
  ble = 'ble',
  usb = 'usb',
}
export const DeviceInterface = types.enumeration<DeviceInterfaceType>(
  'DeviceInterfaceType', Object.values(DeviceInterfaceType)
);

export enum LayoutSizeType {
  sm = 'sm',
  md = 'md',
  lg = 'lg'
}
export const DeviceLayoutSize = types.enumeration<LayoutSizeType>('ThemeMode', Object.values(LayoutSizeType));

export interface SegmentType {start: number, end: number, value: number, label: string};
export interface FiducialType {ts: number, value: number};
export interface MetricType {ts: number, [key: string]: number};
export interface SlotDataMaskEntry {ts: number, value: number, mask: number};
