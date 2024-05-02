import { IDeviceInfo } from '../models/deviceInfo';
import { delay } from '../utils';
import { ApiManager } from './api';

const devices: {id: string, name: string}[] = [
  {
    id: '00001111',
    name: 'Device01',
  }, {
    id: '00002222',
    name: 'Device02',
  }, {
    id: '000003333',
    name: 'Device03',
  },
  {
    id: '000004444',
    name: 'Device04',
  },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min: number, max: number) {
  return Math.random()*(max - min) + min;
}

// function roundf(value: number): number {
//   return Math.round((value + Number.EPSILON) * 100) / 100;
// }

function generateDummySlotSignals(slot: number, numSignals: number, numChs: number, fs: number): {signals: number[][], mask: number[][]} {
  const signals: number[][] = [];
  const mask: number[][] = [];

  const sig_amp = 600;
  const sig_freq = 60/fs;
  const sig_offset = 9384;
  const sig_phi = (0.0/180.0)*Math.PI;

  let ts = Date.now() - numSignals*1000/fs;
  for (let i = 0; i < numSignals; i++) {
    // [5-0] : 6-bit segmentation
    // [7-6] : 2-bit QoS (0:bad, 1:poor, 2:fair, 3:good)
    // [15-8] : 8-bit Fiducial
    const segVal = Math.random() > 0.99 ? randomInt(1, 4) : i > 0 ? mask[i-1][1] & 0x3F : 0;
    const qosVal = Math.random() > 0.99 ? randomInt(0, 0x3) : 3;
    const fidVal = Math.random() > 0.99 ? randomInt(0, 0xF) : 0;
    const maskVal = (fidVal << 8) | (qosVal << 6) | segVal;
    mask.push([ts, maskVal]);
    const signal = [ts];
    for (let ch = 0; ch < numChs; ch++) {
      const val = (sig_amp*Math.cos(2*Math.PI*sig_freq*ts/1000 + sig_phi) + sig_offset);
      signal.push(val);
    }
    ts += 1000/fs;
    signals.push(signal);
  }
  return { signals, mask };
}

function generateDummySlotMetrics(slot: number, numMetrics: number): number[] {
  const ts = Date.now();
  const metrics: number[] = [ts];
  for (let i = 0; i < numMetrics; i++) {
    metrics.push(getRandomFloat(0, 100));
  }
  return metrics;
}

class EmulatorManager implements ApiManager {

  initialized: boolean;
  deviceInfo: Record<string, IDeviceInfo|undefined>;
  callbacks: Record<string, any>;

  constructor() {
    this.initialized = false;
    this.deviceInfo = {};
    this.callbacks = {};
  }

  getDevice(deviceId: string): {id: string, name: string} {
    const device = devices.find(e => e.id === deviceId);
    if (device) return device;
    throw new Error(`Device with ID ${deviceId} doesnt exist`);
  }

  async initialize(): Promise<boolean> {
    return true;
  }

  async startScan(cb: (deviceId: string, name: string) => boolean): Promise<void> {
    await this.initialize();
    let done = false;
    for (const device of devices) {
      await delay(100);
      done = cb(device.id, device.name);
      if (done) {
        console.debug('Scan Finished');
      }
    };
  }

  async stopScan(): Promise<void> {
  }

  async refreshPreviousDevices(deviceIds: string[], cb: (deviceId: string, name: string) => void): Promise<void> {
    const ids = [...deviceIds, ...devices.map(d => d.id)];
    for (const id of ids) {
      await delay(100);
      cb(id, id);
    }
  }

  async refreshPreviousDevice(deviceId: string): Promise<boolean> {
    const devices: string[]  = []
    await this.refreshPreviousDevices([deviceId], (deviceId: string, name: string) => {
      devices.push(deviceId);
    });
    return devices.includes(deviceId);
  }

  async getConnectedDevices(): Promise<string[]> {
    return [];
  }

  async deviceConnect(deviceId: string, deviceInfo: IDeviceInfo, onDisconnect?: (deviceId: string) => void): Promise<void> {
    this.deviceInfo[deviceId] = deviceInfo;
    this.callbacks[`${deviceId}.disconnect`] = onDisconnect;
    await delay(500);
  }

  async deviceDisconnect(deviceId: string): Promise<void> {
    await delay(500);
    this.deviceInfo[deviceId] = undefined;
    const cb = this.callbacks[`${deviceId}.disconnect`];
    if (cb) { cb(deviceId); }
    this.callbacks[`${deviceId}.disconnect`] = undefined;
  }

  async enableSlotNotifications(deviceId: string, slot: number, cb: (slot: number, signals: number[][], mask: number[][]) => Promise<void>): Promise<void> {
    console.log(`enableSlotNotifications ${deviceId} ${slot}`);
    await this.disableSlotNotifications(deviceId, slot);
    const deviceInfo = this.deviceInfo[deviceId];
    if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
      throw new Error('Device info not found');
    }
    const numChs = deviceInfo.slots[slot].chs.length;
    const fs = deviceInfo.slots[slot].fs;
    const maxSlotsPerPacket = Math.floor(120/(numChs+1));
    const numPackets = Math.ceil(fs/maxSlotsPerPacket);
    const ts = 1000/numPackets;
    const numSignals = fs/numPackets;
    console.debug(`${numChs} ${fs} ${numPackets} ${ts} ${numSignals}`);
    const intervalcb = setInterval(() => {
      const rst = generateDummySlotSignals(slot, numSignals, numChs, fs);
      cb(slot, rst.signals, rst.mask);
    }, ts);
    this.callbacks[`dev${deviceId}.slot${slot}.sig`] = intervalcb;
  }

  async disableSlotNotifications(deviceId: string, slot: number): Promise<void> {
    const intervalcb = this.callbacks[`dev${deviceId}.slot${slot}.sig`];
    if (intervalcb) {
      clearInterval(intervalcb);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Metrics Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async enableSlotMetricsNotifications(deviceId: string, slot: number, cb: (slot: number, metrics: number[]) => void): Promise<void> {
    console.log(`enableSlotMetricsNotifications ${deviceId} ${slot}`);
    await this.disableSlotMetricsNotifications(deviceId, slot);
    const deviceInfo = this.deviceInfo[deviceId];
    if (deviceInfo === undefined || slot >= deviceInfo.slots.length) {
      throw new Error('Device info not found');
    }
    const numMetrics = deviceInfo.slots[slot].metrics.length;
    const ts = 1000;
    const intervalcb = setInterval(() => {
        const metrics = generateDummySlotMetrics(slot, numMetrics);
        cb(slot, metrics);
    }, ts);
    this.callbacks[`dev${deviceId}.slot${slot}.met`] = intervalcb;
  }

  async disableSlotMetricsNotifications(deviceId: string, slot: number): Promise<void> {
    const intervalcb = this.callbacks[`dev${deviceId}.slot${slot}.met`];
    if (intervalcb) {
      clearInterval(intervalcb);
    }
  }

  async enableUioNotifications(deviceId: string, cb: (state: number[]) => void): Promise<void> {
    console.log(`enableUioNotifications ${deviceId}`);
    await this.disableUioNotifications(deviceId);
    const ts = 1000;
    const intervalcb = setInterval(async () => {
      const state = await this.getUioState(deviceId);
      cb(state);
    }, ts);
    this.callbacks[`dev${deviceId}.uio`] = intervalcb;
  }

  async disableUioNotifications(deviceId: string): Promise<void> {
    const intervalcb = this.callbacks[`dev${deviceId}.uio`];
    if (intervalcb) {
      clearInterval(intervalcb);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Device Info Routes
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  async getDeviceBatteryLevel(deviceId: string): Promise<number> {
    return Math.round(100*Math.random());
  }

  async getDeviceStrength(deviceId: string): Promise<number> {
    return Math.round(100*Math.random());
  }

  async getUioState(deviceId: string): Promise<number[]> {
    const state = new Array(8).fill(0).map(() => randomInt(0, 2));
    // console.log(`UIO state: ${state}`);
    return state;
  }

  async setUioState(deviceId: string, state: number[]): Promise<void> {
    console.log(`Setting UIO state: ${state}`);
  }

}

const defaultManager = new EmulatorManager();

export default defaultManager;
