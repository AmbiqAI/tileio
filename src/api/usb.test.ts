// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { describe, expect, it } from 'vitest';
import { UsbHandler } from './usb';
import { ISlotConfig } from '../models/slot';
import { delay } from '../utils';

const DEVICE_ID = 'FAKE-0001';
const IFACE = 2;
const ENDPOINT_IN = 1;

const SLOTS = [
  { fs: 100, chs: [{ name: 'ch0' }], dtype: 'f32' },
] as unknown as ISlotConfig[];

/** Minimal stand-in for the WebUSB device object; only what the handler touches. See #41 */
class FakeUsbDevice {
  serialNumber = DEVICE_ID;
  productName = 'Fake TileIO';
  opened = false;
  configuration = {
    interfaces: [{
      interfaceNumber: IFACE,
      alternates: [{
        interfaceClass: 0xFF,
        endpoints: [
          { direction: 'in', endpointNumber: ENDPOINT_IN },
          { direction: 'out', endpointNumber: 3 },
        ],
      }],
    }],
  };
  claims: number[] = [];
  released: number[] = [];
  closes = 0;
  transfers = 0;
  /** Held open by the test to park the connect inside `open()`. */
  openGate?: Promise<void>;

  async open(): Promise<void> {
    if (this.openGate) {
      await this.openGate;
    }
    this.opened = true;
  }
  async close(): Promise<void> {
    this.opened = false;
    this.closes += 1;
  }
  async selectConfiguration(): Promise<void> {}
  async claimInterface(iface: number): Promise<void> {
    if (!this.opened) {
      throw new Error('device is not open');
    }
    this.claims.push(iface);
  }
  async selectAlternateInterface(): Promise<void> {}
  async releaseInterface(iface: number): Promise<void> {
    this.released.push(iface);
  }
  async controlTransferOut(): Promise<unknown> {
    return { status: 'ok', bytesWritten: 0 };
  }
  async transferIn(): Promise<unknown> {
    this.transfers += 1;
    await delay(5);
    return { status: 'ok' };
  }
}

function handlerWith(device: FakeUsbDevice): UsbHandler {
  const handler = new UsbHandler();
  handler.initialized = true;
  handler._devices = [device as unknown as USBDevice];
  return handler;
}

describe('UsbHandler connect/disconnect interleaving', () => {

  it('claims and releases the interface on a clean session', async () => {
    const device = new FakeUsbDevice();
    const handler = handlerWith(device);

    await handler.deviceConnect(DEVICE_ID, SLOTS);
    await delay(20);
    expect(device.claims).toEqual([IFACE]);
    expect(device.transfers).toBeGreaterThan(0);

    await handler.deviceDisconnect(DEVICE_ID);
    const transfersAtTeardown = device.transfers;
    await delay(30);

    expect(device.released).toEqual([IFACE]);
    expect(device.closes).toBe(1);
    expect(device.opened).toBe(false);
    // An orphaned read loop would keep submitting after teardown. See #41
    expect(device.transfers).toBe(transfersAtTeardown);
  });

  it('unwinds a connect that a disconnect supersedes mid-open', async () => {
    const device = new FakeUsbDevice();
    let openDevice = () => {};
    device.openGate = new Promise<void>((resolve) => { openDevice = resolve; });
    const handler = handlerWith(device);

    const connected = handler.deviceConnect(DEVICE_ID, SLOTS);
    await delay(1);
    await handler.deviceDisconnect(DEVICE_ID);
    openDevice();

    await expect(connected).rejects.toThrow(/superseded/);
    await delay(30);

    expect(device.claims).toEqual([]);
    expect(device.transfers).toBe(0);
    expect(device.opened).toBe(false);
    expect(device.closes).toBe(1);
    expect(handler.deviceStates[DEVICE_ID]).toBeUndefined();
  });

  it('lets a later connect run after the superseded one unwinds', async () => {
    const device = new FakeUsbDevice();
    let openDevice = () => {};
    device.openGate = new Promise<void>((resolve) => { openDevice = resolve; });
    const handler = handlerWith(device);

    const connected = handler.deviceConnect(DEVICE_ID, SLOTS);
    await delay(1);
    await handler.deviceDisconnect(DEVICE_ID);
    openDevice();
    await expect(connected).rejects.toThrow(/superseded/);

    device.openGate = undefined;
    await handler.deviceConnect(DEVICE_ID, SLOTS);
    await delay(20);
    expect(device.claims).toEqual([IFACE]);

    await handler.deviceDisconnect(DEVICE_ID);
    await delay(30);
    expect(device.released).toEqual([IFACE]);
  });
});
