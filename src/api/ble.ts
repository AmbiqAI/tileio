/// <reference types="w3c-web-usb" />

import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { delay } from '../utils';
import { IDeviceInfo } from '../models/deviceInfo';
import { ApiManager } from './api';
import { isMobile, dataViewToSignalData, dataViewToMetrics } from './utils';

const TIO_SVC_UUID = "EECB7DB8-8B2D-402C-B995-825538B49328";
const TIO_SLOTS_SIG_CHAR_UUIDS = [
  "5BCA2754-AC7E-4A27-A127-0F328791057A",
  "45415793-A0E9-4740-BCA4-CE90BD61839F",
  "DD19792C-63F1-420F-920C-C58BADA8EFB9",
  "F1F69158-0BD6-4CAB-90A8-528BAF74CC74"
];
const TIO_SLOTS_MET_CHAR_UUIDS = [
  "44A3A7B8-D7C8-4932-9A10-D99DD63775AE",
  "E64FA683-4628-48C5-BEDE-824AAA7C3F5B",
  "B9D28F53-65F0-4392-AFBC-C602F9DC3C8B",
  "917C9EB4-3DBC-4CB3-BBA2-EC4E288083F4"
]

const TIO_UIO_CHAR_UUID = "B9488D48-069B-47F7-94F0-387F7FBFD1FA";
const TIO_BATT_SVC_UUID = numberToUUID(0x180f);
const TIO_BATT_LEVEL_CHAR_UUID = numberToUUID(0x2a19);

class BleManager implements ApiManager {
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
      console.debug('BLE initializing');
      navigator.usb.requestDevice({ filters: [] }).then((device) => {
        console.log(device.productName);
      });
      console.debug('BLE initialized');
    }
    return this.initialized;
  }

  async startScan(cb: (deviceId: string, name: string) => boolean): Promise<void> {
    await this.initialize();
    let done = false;
    const mobile = await isMobile();
    if (mobile) {
      await BleClient.requestLEScan({
        services: [TIO_SVC_UUID],
      }, async (result) => {
        done = cb(result.device.deviceId, result.localName || result.device.deviceId.substring(0, 7));
        if (done) {
          await BleClient.stopLEScan();
        }
      });
    }
    else {
      const device = await BleClient.requestDevice({
        services: [TIO_SVC_UUID],
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
    const devices = await BleClient.getConnectedDevices([TIO_SVC_UUID]);
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
      await delay(200);
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

  async enableSlotNotifications(deviceId: string, slot: number, cb: (slot: number, signals: number[][], mask: number[][]) => Promise<void>): Promise<void> {
    try {
      console.log(`enableSlotNotifications ${deviceId} ${slot}`);
      const deviceInfo = this.deviceInfo[deviceId];
      if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
        throw new Error('Device info not found');
      }
      await BleClient.startNotifications(deviceId, TIO_SVC_UUID,  TIO_SLOTS_SIG_CHAR_UUIDS[slot], async (data: DataView) => {
        try {
          const numChs = deviceInfo.slots[slot].chs.length;
          const fs = deviceInfo.slots[slot].fs;
          const dtype = deviceInfo.slots[slot].dtype;
          const rst = dataViewToSignalData(data, numChs, fs, dtype);
          await cb(slot, rst.signals, rst.mask);
        } catch (error) {
          console.error(`Failed with notifications ${error}`);
        }
      });
    } catch (error) {
      console.error(`Failed enabling signal notifications: ${error}`);
    }
  }

  async disableSlotNotifications(deviceId: string, slot: number): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, TIO_SVC_UUID,  TIO_SLOTS_SIG_CHAR_UUIDS[slot]);
    } catch (error) {
      console.error(`Failed disabling signal notifications: ${error}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Metrics Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async enableSlotMetricsNotifications(deviceId: string, slot: number, cb: (slot: number, metrics: number[]) => void): Promise<void> {
    try {
      console.log(`enableSlotMetricsNotifications ${deviceId} ${slot}`);
      const deviceInfo = this.deviceInfo[deviceId];
      if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
        throw new Error('Device info not found');
      }
      await BleClient.startNotifications(deviceId, TIO_SVC_UUID,  TIO_SLOTS_MET_CHAR_UUIDS[slot], async (data: DataView) => {
        try {
          const metrics = dataViewToMetrics(data);
          cb(slot, metrics);
        } catch (error) {
          console.error('Failed with notifications');
        }
      });
    } catch (error) {
      console.error('Failed enabling metrics notifications');
    }
  }

  async disableSlotMetricsNotifications(deviceId: string, slot: number): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, TIO_SVC_UUID,  TIO_SLOTS_MET_CHAR_UUIDS[slot]);
    } catch (error) {
      console.error(`Failed disabling metrics notifications: ${error}`);
    }
  }

  async enableUioNotifications(deviceId: string, cb: (state: number[]) => void): Promise<void> {
    try {
      await BleClient.startNotifications(deviceId, TIO_SVC_UUID, TIO_UIO_CHAR_UUID, async (data: DataView) => {
        try {
          const state = [];
          for (let i = 0; i < data.byteLength; i++) {
            state.push(data.getUint8(i));
          }
          cb(state);
        } catch (error) {
          console.error('Failed with notifications');
        }
      });
    } catch (error) {
      console.error('Failed enabling UIO notifications');
    }
  }

  async disableUioNotifications(deviceId: string): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, TIO_SVC_UUID, TIO_UIO_CHAR_UUID);
    } catch (error) {
      console.error(`Failed disabling UIO notifications: ${error}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Device Info Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getDeviceBatteryLevel(deviceId: string): Promise<number> {
    try {
      return (await BleClient.read(deviceId, TIO_BATT_SVC_UUID, TIO_BATT_LEVEL_CHAR_UUID)).getUint8(0);
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
    const data = await BleClient.read(deviceId, TIO_SVC_UUID, TIO_UIO_CHAR_UUID);
    const state = [];
    for (let i = 0; i < data.byteLength; i++) {
      state.push(data.getUint8(i));
    }
    console.log(`UIO state: ${state}`);
    return state;
  }

  async setUioState(deviceId: string, state: number[]): Promise<void> {
    const buffer = new ArrayBuffer(state.length);
    const data = new DataView(buffer);
    for (let i = 0; i < state.length; i++) {
      data.setUint8(i, state[i]);
    }
    await this.bleWrite(deviceId, TIO_SVC_UUID, TIO_UIO_CHAR_UUID, data);
    console.debug(`Setting UIO state: ${data}`);
  }

}

const defaultManager = new BleManager();

export default defaultManager;
