import { Instance, SnapshotIn, types } from 'mobx-state-tree';

export enum DeviceConnectionType {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED'
}
export const DeviceConnectionState = types.enumeration<DeviceConnectionType>(
  'DeviceConnectionState', Object.values(DeviceConnectionType)
);

const DeviceState = types
.model('DeviceState', {
  online: types.optional(types.boolean, false),
  connectionState: types.optional(DeviceConnectionState, DeviceConnectionType.DISCONNECTED),
  batteryLevel: types.optional(types.number, 0),
  signalStrength: types.optional(types.number, 0)
})
.volatile(self => ({
}))
.views(self => ({
  get connecting() {
    return self.connectionState === DeviceConnectionType.CONNECTING;
  },
  get connected() {
    return self.connectionState === DeviceConnectionType.CONNECTED;
  },
  get disconnecting() {
    return self.connectionState === DeviceConnectionType.DISCONNECTING;
  },
  get disconnected() {
    return self.connectionState === DeviceConnectionType.DISCONNECTED;
  },
}))
.actions(self => ({
  setOnline: function(online: boolean) {
    self.online = online;
  },
  setConnectionState: function(state: DeviceConnectionType) {
    self.connectionState = state;
  },
  setBatteryLevel: function(batteryLevel: number) {
    self.batteryLevel = batteryLevel;
  },
  setSignalStrength: function(signalStrength: number) {
    self.signalStrength = signalStrength;
  },
  reset: function() {
    self.online = false;
    self.connectionState = DeviceConnectionType.DISCONNECTED;
    self.batteryLevel = 0;
    self.signalStrength = 0;
  }
}));

export default DeviceState;
export interface IDeviceState extends Instance<typeof DeviceState> {}
export interface IDeviceStateSnapshot extends SnapshotIn<typeof DeviceState> {}