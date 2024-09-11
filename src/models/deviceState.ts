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
})
.volatile(self => ({
  online: false,
  connectionState: DeviceConnectionType.DISCONNECTED,
  batteryLevel: 0,
  signalStrength: 0,
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
  get connectStateName() {
    switch (self.connectionState) {
      case DeviceConnectionType.CONNECTING:
        return 'Connecting';
      case DeviceConnectionType.CONNECTED:
        return 'Connected';
      case DeviceConnectionType.DISCONNECTING:
        return 'Disconnecting';
      case DeviceConnectionType.DISCONNECTED:
        return 'Disconnected';
    }
  }
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

export const DefaultDeviceState = (id: string) => DeviceState.create({
});
