import { isPlatform } from '@ionic/react';
import { Device } from '@capacitor/device';

export async function isMobile(): Promise<boolean> {
  const info = await Device.getInfo();
  return isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
}

function getDataByteLength(dtype: string): number {
  if (dtype === 'u16' || dtype === 'i16') {
    return 2;
  } else if (dtype === 'u32' || dtype === 'i32' || dtype === 'f32') {
    return 4;
  } else if (dtype === 'i8' || dtype === 'u8') {
    return 1;
  }
  return 0;
}

const TIMED_SIGNAL_MAGIC0 = 0x54;
const TIMED_SIGNAL_MAGIC1 = 0x53;
const TIMED_SIGNAL_VERSION = 1;
const TIMED_SIGNAL_HEADER_LEN = 12;
const STREAM_PLAYOUT_DELAY_MS = 500;

export interface SignalClock {
  lastTs: number;
  sourceBaseMs?: number;
  hostBaseMs?: number;
  lastSourceDeltaMs?: number;
  lastSequence?: number;
}

export function createSignalClock(): SignalClock {
  return { lastTs: 0 };
}

export function dataViewToSignalData(data: DataView, numChs: number, fs: number, dtype: string, clock: SignalClock): {signals: number[][], mask: number[][], ts: number} {
  const ts = 1000/fs;
  const byteLen = getDataByteLength(dtype);
  const stride = numChs * byteLen + 2;
  const packetLen = data.getUint16(0, true);
  let signalBytes = packetLen;
  let offset = 2;
  let sourceMs: number|undefined;
  let sequence: number|undefined;

  if (packetLen >= TIMED_SIGNAL_HEADER_LEN &&
      data.byteLength >= 2 + TIMED_SIGNAL_HEADER_LEN &&
      data.getUint8(2) === TIMED_SIGNAL_MAGIC0 &&
      data.getUint8(3) === TIMED_SIGNAL_MAGIC1 &&
      data.getUint8(4) === TIMED_SIGNAL_VERSION) {
    sourceMs = data.getUint32(6, true);
    sequence = data.getUint16(10, true);
    signalBytes = data.getUint16(12, true);
    offset += TIMED_SIGNAL_HEADER_LEN;
    if (signalBytes + TIMED_SIGNAL_HEADER_LEN > packetLen) {
      throw new Error('Timed signal payload length exceeds packet length');
    }
  }
  if (stride === 0 || signalBytes % stride !== 0) {
    throw new Error('Invalid signal payload length');
  }
  const signalLen = signalBytes / stride;
  const signals: number[][] = [];
  const mask: number[][] = [];
  if (!signalLen) {
    return {signals, mask, ts: clock.lastTs};
  }

  const now = Date.now();
  const latestAllowed = now - STREAM_PLAYOUT_DELAY_MS;
  let lastSampleTs: number;
  if (sourceMs !== undefined) {
    if (clock.sourceBaseMs === undefined || clock.hostBaseMs === undefined) {
      clock.sourceBaseMs = sourceMs;
      clock.hostBaseMs = latestAllowed;
    }
    const sourceDeltaMs = (sourceMs - clock.sourceBaseMs) >>> 0;
    if (clock.lastSourceDeltaMs !== undefined && sourceDeltaMs <= clock.lastSourceDeltaMs) {
      return {signals, mask, ts: clock.lastTs};
    }
    lastSampleTs = clock.hostBaseMs + sourceDeltaMs;
    if (lastSampleTs > latestAllowed) {
      clock.hostBaseMs -= lastSampleTs - latestAllowed;
      lastSampleTs = latestAllowed;
    }
    clock.lastSourceDeltaMs = sourceDeltaMs;
    clock.lastSequence = sequence;
  } else {
    // Legacy packets have no source clock. Drop compressed bursts instead of
    // manufacturing future timestamps from arrival time.
    lastSampleTs = clock.lastTs ? Math.min(clock.lastTs + signalLen * ts, latestAllowed) : latestAllowed;
    if (clock.lastTs && lastSampleTs <= clock.lastTs) {
      return {signals, mask, ts: clock.lastTs};
    }
  }

  let refDate = lastSampleTs - (signalLen - 1) * ts;
  for (let i = 0; i < signalLen; i++) {
    mask.push([refDate, data.getUint16(offset, true)]);
    offset += 2;
    let row = [refDate];
    for (let ch = 0; ch < numChs; ch++) {
      if (dtype === 'u16') {
        row.push(data.getUint16(offset, true));
      } else if (dtype === 'i16') {
        row.push(data.getInt16(offset, true));
      } else if (dtype === 'u32') {
        row.push(data.getUint32(offset, true));
      } else if (dtype === 'i32') {
        row.push(data.getInt32(offset, true));
      } else if (dtype === 'f32') {
        row.push(data.getFloat32(offset, true));
      } else if (dtype === 'i8') {
        row.push(data.getInt8(offset));
      } else {
        row.push(data.getUint8(offset));
      }
      offset += byteLen;
    }
    signals.push(row);
    refDate += ts;
  }
  clock.lastTs = lastSampleTs;
  return {signals, mask, ts: lastSampleTs};
}

export function dataViewToMetrics(data: DataView): number[] {
  const ts = Date.now();
  const byteLen = 4;
  const metricLen = data.getUint16(0, true) / byteLen;
  const metrics: number[] = [ts];
  let offset = 2;
  for (let i = 0; i < metricLen; i++) {
    metrics.push(data.getFloat32(offset, true));
    offset += 4;
  };
  return metrics;
}


export function calculateCRC16(data: Uint8Array) {
  const polynomial = 0x1021;  // 0xEF4A  0x1021
  let crc = 0xEF4A; // 0xFFFF;
  for (let i = 0; i < data.length; i++) {
      crc ^= (data[i] << 8);
      for (let j = 0; j < 8; j++) {
          crc = (crc & 0x8000) ? ((crc << 1) ^ polynomial) : (crc << 1);
      }
  }
  return crc & 0xFFFF;

}
