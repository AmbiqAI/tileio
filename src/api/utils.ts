// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { isPlatform } from '@ionic/react';
import { Device } from '@capacitor/device';
import { PlayoutClock } from './playoutClock';

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

/**
 * Decode a signal frame into `[ts, ...channels]` rows.
 *
 * Timestamps come from the slot's {@link PlayoutClock}, not from arrival time,
 * so bursty transports still produce evenly spaced, monotonic timestamps.
 * `discontinuity` is set when the clock re-anchored (genuine stall, dropped
 * backlog or sampling-rate change) and the trace must be broken.
 *
 * The frame is dropped (empty result) when the clock is bounding staleness.
 */
export function dataViewToSignalData(data: DataView, numChs: number, dtype: string, clock: PlayoutClock): {signals: number[][], mask: number[][], discontinuity: boolean} {
  const byteLen = getDataByteLength(dtype);
  const signalLen = data.getUint16(0, true) / (numChs * byteLen + 2);
  const signals: number[][] = [];
  const mask: number[][] = [];
  let offset = 2;
  const slice = clock.stamp(signalLen);
  if (slice.count === 0) {
    return {signals, mask, discontinuity: slice.discontinuity};
  }
  for (let i = 0; i < slice.count; i++) {
    const refDate = slice.startTs + i * slice.interval;
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
  };
  return {signals, mask, discontinuity: slice.discontinuity};
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
