import { isPlatform } from '@ionic/react';
import { Device } from '@capacitor/device';

export async function isMobile(): Promise<boolean> {
  const info = await Device.getInfo();
  return isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
}

export function dataViewToSignalData(data: DataView, numChs: number, fs: number, dtype: string): {signals: number[][], mask: number[][]} {
  // let dtype = 'i16'; // u8, u16, i16, u32, i32, f32  const decoder =
  const ts = 1000/fs;
  const signalLen = data.getUint16(0, true);
  const signals: number[][] = [];
  const mask: number[][] = [];
  let offset = 2;
  let refDate = Date.now() - ts*signalLen;
  for (let i = 0; i < signalLen; i++) {
    mask.push([refDate, data.getUint16(offset, true)]);
    offset += 2;
    let row = [refDate];
    for (let ch = 0; ch < numChs; ch++) {
      if (dtype === 'u16') {
        row.push(data.getUint16(offset, true));
        offset += 2;
      } else if (dtype === 'i16') {
        row.push(data.getInt16(offset, true));
        offset += 2;
      } else if (dtype === 'u32') {
        row.push(data.getUint32(offset, true));
        offset += 4;
      } else if (dtype === 'i32') {
        row.push(data.getInt32(offset, true));
        offset += 4;
      } else if (dtype === 'f32') {
        row.push(data.getFloat32(offset, true));
        offset += 4;
      } else if (dtype === 'i8') {
        row.push(data.getInt8(offset));
        offset += 1;
      } else {
        row.push(data.getUint8(offset));
        offset += 1;
      }
      // row.push(data.getInt16(offset, true));
      // offset += 2;
    }
    signals.push(row);
    refDate += ts;
  };
  return {signals, mask};
}

export function dataViewToMetrics(data: DataView): number[] {
  const ts = Date.now();
  const metricLen = data.getUint16(0, true);
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


// uint16_t computeCRC16(const uint8_t *data, uint32_t lengthInBytes)
// {
//     uint32_t m_crcStart = 0xEF4A;
//     uint32_t crc = m_crcStart;
//     uint32_t j;
//     uint32_t i;
//     uint32_t byte;
//     uint32_t temp;
//     const uint32_t andValue = 0x8000U;
//     const uint32_t xorValue = 0x1021U;

//     for (j = 0; j < lengthInBytes; ++j)
//     {
//         byte = data[j];
//         crc ^= byte << 8;
//         for (i = 0; i < 8U; ++i)
//         {
//             temp = crc << 1;
//             if (0UL != (crc & andValue))
//             {
//                 temp ^= xorValue;
//             }
//             crc = temp;
//         }
//     }

//     return (uint16_t)crc;
// }
