import { isPlatform } from '@ionic/react';
import { Device } from '@capacitor/device';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { delay } from '../utils';
import { IDeviceInfo } from '../models/deviceInfo';

const PK_SVC_UUID = "EECB7DB8-8B2D-402C-B995-825538B49328";
const PK_SLOTS_SIG_CHAR_UUIDS = [
  "5BCA2754-AC7E-4A27-A127-0F328791057A",
  "45415793-A0E9-4740-BCA4-CE90BD61839F",
  "DD19792C-63F1-420F-920C-C58BADA8EFB9",
  "F1F69158-0BD6-4CAB-90A8-528BAF74CC74"
];
const PK_SLOTS_MET_CHAR_UUIDS = [
  "44A3A7B8-D7C8-4932-9A10-D99DD63775AE",
  "E64FA683-4628-48C5-BEDE-824AAA7C3F5B",
  "B9D28F53-65F0-4392-AFBC-C602F9DC3C8B",
  "917C9EB4-3DBC-4CB3-BBA2-EC4E288083F4"
]

const PK_UIO_CHAR_UUID = "B9488D48-069B-47F7-94F0-387F7FBFD1FA";
const PK_BATT_SVC_UUID = numberToUUID(0x180f);
const PK_BATT_LEVEL_CHAR_UUID = numberToUUID(0x2a19);


function dataViewToSignalData(data: DataView, numChs: number, fs: number): {signals: number[][], mask: number[][]} {
  const ts = 1000/fs;
  const signalLen = data.getUint16(0, true);
  const signals: number[][] = [];
  const mask: number[][] = [];
  let offset = 2;
  let refDate = Date.now() - ts*signalLen;
  for (let i = 0; i < signalLen; i++) {
    mask.push([refDate, data.getUint16(offset)]);
    offset += 2;
    let row = [refDate];
    for (let ch = 0; ch < numChs; ch++) {
      row.push(data.getInt16(offset, true));
      offset += 2;
    }
    refDate += ts;
  };
  return {signals, mask};
}

function dataViewToMetrics(data: DataView): number[] {
  const metricLen = data.getUint16(0, true);
  const metrics: number[] = [];
  let offset = 2;
  for (let i = 0; i < metricLen; i++) {
    metrics.push(data.getFloat32(offset, true));
    offset += 4;
  };
  return metrics;
}

async function isMobile(): Promise<boolean> {
  const info = await Device.getInfo();
  return isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
}


class BleManager {
  initialized: boolean;
  deviceInfo: Record<string, IDeviceInfo|undefined>;
  callbacks: Record<string, any>;

  constructor() {
    this.initialized = false;
    this.deviceInfo = {};
    this.callbacks = {};
  }

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      await BleClient.initialize();
      this.initialized = true;
    }
    return this.initialized;
  }

  async startScan(cb: (deviceId: string, name: string) => boolean): Promise<void> {
    await this.initialize();
    let done = false;
    const mobile = await isMobile();
    if (mobile) {
      await BleClient.requestLEScan({
        services: [PK_SVC_UUID],
      }, async (result) => {
        done = cb(result.device.deviceId, result.localName || result.device.deviceId.substring(0, 7));
        if (done) {
          await BleClient.stopLEScan();
        }
      });
    } else {
      const device = await BleClient.requestDevice({
        services: [PK_SVC_UUID],
        optionalServices: []
      });
      cb(device.deviceId, device.name || device.deviceId);
    }
  }

  async stopScan(): Promise<void> {
    await BleClient.stopLEScan();
  }

  async refreshPreviousDevices(deviceIds: string[], cb: (deviceId: string, name: string) => void): Promise<void> {
    const devices: string[] = [];
    await this.startScan((deviceId: string, name: string) => {
      if (deviceIds.includes(deviceId)) {
        devices.push(deviceId);
        cb(deviceId, name);
      }
      // Stop early if we found all devices
      return devices.length === deviceIds.length;
    });
    await delay(4000);
    await this.stopScan();
  }

  async refreshPreviousDevice(deviceId: string): Promise<boolean> {
    await this.initialize();
    const devices = await BleClient.getDevices([deviceId]);
    return devices.map(d => d.deviceId).includes(deviceId);
  }

  async getConnectedDevices(): Promise<string[]> {
    const devices = await BleClient.getConnectedDevices([PK_SVC_UUID]);
    return devices.map(d => d.deviceId);
  }

  async deviceConnect(deviceId: string, deviceInfo: IDeviceInfo, onDisconnect?: (deviceId: string) => void): Promise<void> {
    await this.deviceDisconnect(deviceId);
    this.deviceInfo[deviceId] = deviceInfo;
    await BleClient.connect(deviceId, onDisconnect);
    await delay(100);
    await BleClient.getServices(deviceId);
  }

  async deviceDisconnect(deviceId: string): Promise<void> {
    this.deviceInfo[deviceId] = undefined;
    await BleClient.disconnect(deviceId);
  }

  async bleWrite(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void> {
    try {
      await BleClient.write(deviceId, service, characteristic, value);
      await delay(100);
    } catch (error) {
      const err_msg = (error as Error).message;
      if (err_msg.includes('Unlikely error') || err_msg.includes('unknown reason')) {
        console.debug('TODO: Known write bug error code 14- Unlikely error');
      } else {
        console.error(error);
        throw error;
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Metrics Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async enableSignalNotifications(deviceId: string, slot: number, cb: (signals: number[][], mask: number[][]) => Promise<void>): Promise<void> {
    try {
      const deviceInfo = this.deviceInfo[deviceId];
      if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
        throw new Error('Device info not found');
      }
      await BleClient.startNotifications(deviceId, PK_SVC_UUID,  PK_SLOTS_SIG_CHAR_UUIDS[slot], async (data: DataView) => {
        try {
          const numChs = deviceInfo.slots[slot].chs.length;
          const fs = deviceInfo.slots[slot].fs;
          const rst = dataViewToSignalData(data, numChs, fs);
          await cb(rst.signals, rst.mask);
        } catch (error) {
          console.error(`Failed with notifications ${error}`);
        }
      });
    } catch (error) {
      console.error(`Failed enabling signal notifications: ${error}`);
    }
  }

  async disableSignalNotifications(deviceId: string, slot: number): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, PK_SVC_UUID,  PK_SLOTS_SIG_CHAR_UUIDS[slot]);
    } catch (error) {
      console.error(`Failed disabling signal notifications: ${error}`);
    }
  }

  async enableMetricsNotifications(deviceId: string, slot: number, cb: (metrics: number[]) => Promise<void>): Promise<void> {
    try {
      const deviceInfo = this.deviceInfo[deviceId];
      if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
        throw new Error('Device info not found');
      }
      await BleClient.startNotifications(deviceId, PK_SVC_UUID,  PK_SLOTS_MET_CHAR_UUIDS[slot], async (data: DataView) => {
        try {
          const metrics = dataViewToMetrics(data);
          await cb(metrics);
        } catch (error) {
          console.error('Failed with notifications');
        }
      });
    } catch (error) {
      console.error('Failed enabling metrics notifications');
    }
  }

  async disableMetricsNotifications(deviceId: string, slot: number): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, PK_SVC_UUID,  PK_SLOTS_MET_CHAR_UUIDS[slot]);
    } catch (error) {
      console.error(`Failed disabling metrics notifications: ${error}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Device Info Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getDeviceBatteryLevel(deviceId: string): Promise<number> {
    try {
      return (await BleClient.read(deviceId, PK_BATT_SVC_UUID, PK_BATT_LEVEL_CHAR_UUID)).getUint8(0);
    } catch (error) {
    }
    return -1;
  }

  async getDeviceStrength(deviceId: string): Promise<number> {
    const mobile = await isMobile();
    if (mobile) {
      let rssi = await BleClient.readRssi(deviceId);
      rssi = Math.max(40, Math.min(100, Math.abs(rssi)));
      const signalStrength = 100 * (1.0 - (rssi - 40.0) / (100.0 - 40.0));
      return signalStrength;
    }
    return -1;
  }

  async getUioState(deviceId: string): Promise<number[]> {
    const data = await BleClient.read(deviceId, PK_SVC_UUID, PK_UIO_CHAR_UUID);
    const state = [];
    for (let i = 0; i < data.byteLength; i++) {
      state.push(data.getUint8(i));
    }
    return state;
  }

  async setUioState(deviceId: string, state: number[]): Promise<void> {
    const data = new DataView(new ArrayBuffer(state.length));
    for (let i = 0; i < state.length; i++) {
      data.setUint8(i, state[i]);
    }
    await this.bleWrite(deviceId, PK_SVC_UUID, PK_UIO_CHAR_UUID, data);
  }

}

export default new BleManager();
