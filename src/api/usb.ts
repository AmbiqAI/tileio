/// <reference types="w3c-web-usb" />

import { ApiHandler, SlotSignalCallback } from "./handler";
import { calculateCRC16, dataViewToSignalData, dataViewToMetrics, isMobile } from './utils';
import { PlayoutClock } from './playoutClock';
import { ISlotConfig } from "../models/slot";
import { delay } from "../utils";

enum PacketType {
  Signal = 0,
  Metrics = 1,
  Uio = 2,
}

  // A packet includes the following fields:
  //  START: 1 bytes [0x55]
  //  SLOT: 1 byte [0,1,2,3]
  //  TYPE: 1 byte [0,1,2]
  //  LENGTH: 2 bytes [Length of data]
  //  DATA: 248 bytes [...]
  //  CRC: 2 bytes [CRC16]
  //  STOP: 1 byte [0xAA]

const TIO_USB_VENDOR_ID = 0xCAFE
const TIO_USB_PRODUCT_ID = 0x0001;
const TIO_USB_PACKET_LEN = 256;
const TIO_USB_START_IDX = 0;
const TIO_USB_START_VAL = 0x55;
const TIO_USB_SLOT_IDX = 1;
const TIO_USB_TYPE_IDX = 2;
const TIO_USB_DLEN_IDX = 3;
const TIO_USB_DLEN_LEN = 2;

const TIO_USB_DATA_IDX = 5;
const TIO_USB_DATA_LEN = 248;
const TIO_USB_CRC_IDX = 253;
const TIO_USB_CRC_LEN = 2;
const TIO_USB_STOP_IDX = 255;
const TIO_USB_STOP_VAL = 0xAA;
const TIO_USB_UIO_REQUEST_TIMEOUT_MS = 1500;
const TIO_USB_UIO_REQUEST_ATTEMPTS = 3;

interface UioRequest {
  resolve: (state: number[]) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Create device object to store the following:
// slotConfigs: ISlotConfig[]
// device: USBDevice
// fifo: Uint8Array
// slotClocks: PlayoutClock[]
// interface

class DeviceState {
  slotConfigs: ISlotConfig[];
  device: USBDevice;
  fifo: Uint8Array;
  /** Per-slot virtual sample clock used to timestamp incoming signal frames. */
  slotClocks: PlayoutClock[];
  interface: number;
  uioRequest?: UioRequest;

  constructor(device: USBDevice) {
    this.device = device;
    this.slotConfigs = [];
    this.fifo = new Uint8Array([]);
    this.slotClocks = [];
    this.interface = 0;
  }
}


export class UsbHandler implements ApiHandler {

  initialized: boolean;
  callbacks: Record<string, any>;
  _devices: USBDevice[];
  deviceStates: Record<string, DeviceState>;

  constructor() {
    this.initialized = false;
    this.callbacks = {};
    this._devices = [];
    this.deviceStates = {};
  }

  _disconnectCallback(event: USBConnectionEvent) {
    console.debug('USB Disconnect CB', event);
  }

  static async supportedPlatform(): Promise<boolean> {
    // USB only supported on some browsers (e.g. Chrome)
    // const mobile = await isMobile();
    return !!navigator.usb;
  }

  async initialize(): Promise<boolean> {
    // Verify if webUSB is supported
    if (this.initialized) {
      return true;

    }
    this.initialized = true;
    navigator.usb.ondisconnect = this._disconnectCallback;
    return true;
  }

  async _getDevice(deviceId: string): Promise<USBDevice|undefined> {
    return this._devices.find(device => device.serialNumber === deviceId);
  }

  async _addDevice(device: USBDevice): Promise<void> {
    if (!this._devices.find(d => d.serialNumber === device.serialNumber)) {
      this._devices.push(device);
    }
  }

  async _removeDevice(deviceId: string): Promise<void> {
    const idx = this._devices.findIndex(device => device.serialNumber === deviceId);
    if (idx >= 0) {
      this._devices.splice(idx, 1);
    }
  }

  encodePacket(slot: number, ptype: PacketType, data: number[]): ArrayBuffer {
    const packet = new ArrayBuffer(TIO_USB_PACKET_LEN);
    const dataView = new DataView(packet);

    dataView.setUint8(TIO_USB_START_IDX, TIO_USB_START_VAL);
    dataView.setUint8(TIO_USB_SLOT_IDX, slot);
    dataView.setUint8(TIO_USB_TYPE_IDX, ptype);
    // Set data length
    dataView.setUint16(TIO_USB_DLEN_IDX, data.length, true);
    // Fill data
    for (let i = 0; i < data.length; i++) {
      dataView.setUint8(TIO_USB_DATA_IDX + i, data[i]);
    }
    // Fill remaining data with zeros
    for (let i = data.length; i < TIO_USB_DATA_LEN; i++) {
      dataView.setUint8(TIO_USB_DATA_IDX + i, 0);
    }
    // const crc = calculateCRC16(Uint8Array.from(data));
    const crcData = new Uint8Array(dataView.buffer.slice(TIO_USB_DLEN_IDX, TIO_USB_DLEN_IDX + data.length + TIO_USB_DLEN_LEN));
    const crc = calculateCRC16(crcData);
    dataView.setUint16(TIO_USB_CRC_IDX, crc, true);
    dataView.setUint8(TIO_USB_STOP_IDX, TIO_USB_STOP_VAL);
    return packet;
  }

  async decodePacket(deviceId: string, packet: DataView) {

    if (packet.byteLength !== TIO_USB_PACKET_LEN) {
      console.warn(`Invalid packet length ${packet.byteLength}`);
      return null;
    }
    const frameStart = packet.getUint8(TIO_USB_START_IDX);
    const slotIdx = packet.getUint8(TIO_USB_SLOT_IDX);
    const ptype = packet.getUint8(TIO_USB_TYPE_IDX);
    const dLength = packet.getUint16(TIO_USB_DLEN_IDX, true);
    // Include data length and data
    const data = new Uint8Array(packet.buffer.slice(
      TIO_USB_DLEN_IDX, TIO_USB_DLEN_IDX + dLength + 2
    ));
    const crc = packet.getUint16(TIO_USB_CRC_IDX, true);
    // Check CRC
    const actualCrc = calculateCRC16(data);
    const frameStop = packet.getUint8(TIO_USB_STOP_IDX);
    if (crc !== actualCrc) {
      // Reject rather than dispatch: `dLength` is part of the CRC-covered
      // region, so a corrupt length would feed a bogus sample count into the
      // slot's playout clock and skew its timeline irrecoverably.
      console.warn(`CRC error ${crc} ${actualCrc}`);
      return null;
    }
    if (frameStart !== 0x55 || frameStop !== 0xAA) {
      console.warn(`Frame error start: ${frameStart} stop: ${frameStop}`);
      return null;
    }

    const slots = this.deviceStates[deviceId].slotConfigs;

    // Handle slot signal
    if (ptype == PacketType.Signal) {
      const cb = this.callbacks[`dev${deviceId}.slot${slotIdx}.sig`];
      if (slots == undefined || slotIdx >= slots.length || cb == undefined) {
        return null;
      }
      const slot = slots[slotIdx];
      const clock = this.deviceStates[deviceId].slotClocks[slotIdx];
      if (clock === undefined) {
        return null;
      }
      // Slot configs stay editable while connected, so track `fs` live.
      clock.setFs(slot.fs);
      const rst = dataViewToSignalData(new DataView(data.buffer), slot.chs.length, slot.dtype, clock);
      if (rst.signals.length === 0) {
        return null;
      }
      await cb(slotIdx, rst.signals, rst.mask, rst.discontinuity);

    } else if (ptype == PacketType.Metrics) {
      const cb = this.callbacks[`dev${deviceId}.slot${slotIdx}.met`];
      if (slots == undefined || slotIdx >= slots.length || cb == undefined) {
        return null;
      }
      const rst = dataViewToMetrics(new DataView(data.buffer));
      await cb(slotIdx, rst);

    } else if (ptype == PacketType.Uio) {
      if (data.length !== 10) {
        console.warn(`Invalid UIO state length: ${data.length}`);
        return null;
      }
      const state = Array.from(data).slice(2, 10);
      const deviceState = this.deviceStates[deviceId];
      const request = deviceState.uioRequest;
      if (request) {
        clearTimeout(request.timeout);
        deviceState.uioRequest = undefined;
        request.resolve(state);
      }
      const cb = this.callbacks[`dev${deviceId}.uio`];
      if (cb !== undefined) {
        await cb(state);
      }

    }
  }

  async enqueueFrame(deviceId: string, frame: DataView): Promise<void> {
    // Combine with existing fifo
    this.deviceStates[deviceId].fifo = new Uint8Array([...this.deviceStates[deviceId].fifo, ...new Uint8Array(frame.buffer)]);

    const fifo = this.deviceStates[deviceId].fifo;

    let offset = 0;
    while (fifo.length - offset >= TIO_USB_PACKET_LEN) {
      const packet = new DataView(fifo.buffer.slice(offset, offset + TIO_USB_PACKET_LEN));
      // Check if frame is complete
      if (packet.getUint8(TIO_USB_START_IDX) !== TIO_USB_START_VAL || packet.getUint8(TIO_USB_STOP_IDX) !== TIO_USB_STOP_VAL) {
        console.warn(`Invalid frame start/stop`);
        offset += 1;
      } else {
        await this.decodePacket(deviceId, packet);
        offset += TIO_USB_PACKET_LEN;
      }
    }
    this.deviceStates[deviceId].fifo = new Uint8Array(fifo.buffer.slice(offset));
  }

  /**
   * Start scanning for available devices.
   * On web, user will be prompted and can only select one device.
   * On electron, provide a list of cached devices.
   * On ios/ipados, usb is not supported.
   * @param cb Callback function that will be called for each device found.
   */
  async startScan(cb: (deviceId: string, name: string) => boolean): Promise<void> {
    await this.initialize();
    let done = false;
    //
    // this._devices = await navigator.usb.getDevices();
    this._devices = [
      await navigator.usb.requestDevice({ filters: [{vendorId: TIO_USB_VENDOR_ID}] })
    ];
    this._devices.forEach(device => {
      const deviceId = device.serialNumber || `${device.productId}`;
      const deviceName = device.productName || `${device.vendorId}:${device.productId}`;
      done = cb(deviceId, deviceName);
    });
  }

  async stopScan(): Promise<void> {
    // Nothing to do
  }

  async refreshPreviousDevices(deviceIds: string[], cb: (deviceId: string, name: string) => void): Promise<void> {
    await this.initialize();
    deviceIds.forEach(async deviceId => {
      cb(deviceId, deviceId);
    });
  }

  async refreshPreviousDevice(deviceId: string): Promise<boolean> {
    await this._removeDevice(deviceId);
    const dev = await navigator.usb.requestDevice({ filters: [{ serialNumber: deviceId }] });
    await this._addDevice(dev);
    return !!dev;
  }

  async getConnectedDevices(): Promise<string[]> {
    return this._devices.map(device => device.serialNumber || `${device.productId}`);
  }

  async enableDevicePolling(deviceId: string): Promise<void> {
    const device = await this._getDevice(deviceId);
    if (device) {
      this.deviceStates[deviceId].fifo = new Uint8Array([]);

      // Select configuration
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // Iterate through interfaces
      let iface;
      let ifaceNumber = 0;
      let endpointIn = 0;
      let endpointOut = 0;
      for (let i = 0; i < device.configuration!.interfaces.length; i++) {
        iface = device.configuration!.interfaces[i];
        for (let j = 0; j < iface.alternates.length; j++) {
          const alternate = iface.alternates[j];
          if (alternate.interfaceClass !== 0xFF) {
            continue;
          }
          ifaceNumber = iface.interfaceNumber;
          for (let k = 0; k < alternate.endpoints.length; k++) {
            if (alternate.endpoints[k].direction === 'in') {
              endpointIn = alternate.endpoints[k].endpointNumber;
            } else {
              endpointOut = alternate.endpoints[k].endpointNumber;
            }
          }
        }
      }

      // Claim interface
      console.debug(`USB claiming interface ${ifaceNumber} endpointIn ${endpointIn} endpointOut ${endpointOut}`);
      await device.claimInterface(ifaceNumber);
      await device.selectAlternateInterface(ifaceNumber, 0);
      await device.controlTransferOut({
        'requestType' : 'class',
        'recipient' : 'interface',
        'request' : 0x22,
        'value' : 0x01,
        'index' : ifaceNumber
      });

      this.deviceStates[deviceId].fifo = new Uint8Array([]);
      this.deviceStates[deviceId].interface = ifaceNumber;

      const intervalcb = setTimeout(async () => {
        let done = false;
        while (!done) {
          try {
            if (!device || device.opened === false) {
              done = true;
              console.debug(`Device ${deviceId} closed`);
              this.deviceDisconnect(deviceId);
            } else {
              const rst = await device.transferIn(endpointIn, 64);
              if (rst.status === 'ok' && rst.data) {
                await this.enqueueFrame(deviceId, rst.data);
              }
            }
          } catch (error) {
            console.error(error);
            await delay(10);
          }
        }
      }, 1);
      this.callbacks[`dev${deviceId}.poll`] = intervalcb;
    }
  }

  async disableDevicePolling(deviceId: string): Promise<void> {
    const timeout = this.callbacks[`dev${deviceId}.poll`];
    if (timeout) {
      clearTimeout(timeout);
      this.callbacks[`dev${deviceId}.poll`] = undefined;
    }
    this.deviceStates[deviceId].fifo = new Uint8Array([]);

  }

  async deviceConnect(deviceId: string, slots: ISlotConfig[], onDisconnect?: (deviceId: string) => void): Promise<void> {

    this.callbacks[`dev${deviceId}.disconnect`] = onDisconnect;

    let device = await this._getDevice(deviceId);
    if (!device) {
      await this.refreshPreviousDevice(deviceId);
      device = await this._getDevice(deviceId);
    }

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    this.deviceStates[deviceId] = new DeviceState(device);
    this.deviceStates[deviceId].slotConfigs = slots;
    this.deviceStates[deviceId].slotClocks = slots.map(s => new PlayoutClock({ fs: s.fs }));

    await device.open();

    await this.enableDevicePolling(deviceId);
  }


  async deviceDisconnect(deviceId: string): Promise<void> {
    const device = this._devices.find(device => device.serialNumber === deviceId);
    if (!device) {
      return;
    }
    const deviceState = this.deviceStates[deviceId];
    const ifaceNumber = deviceState.interface;
    if (deviceState.uioRequest) {
      clearTimeout(deviceState.uioRequest.timeout);
      deviceState.uioRequest.reject(new Error('USB device disconnected while waiting for UIO state'));
      deviceState.uioRequest = undefined;
    }
    this.deviceStates[deviceId].slotConfigs = [];
    this.deviceStates[deviceId].fifo = new Uint8Array([]);
    this.deviceStates[deviceId].slotClocks = [];

    await this.disableDevicePolling(deviceId);

    for (let i = 0; i < 4; i++) {
      await this.disableSlotNotifications(deviceId, i);
      await this.disableSlotMetricsNotifications(deviceId, i);
    }
    await this.disableUioNotifications(deviceId);
    const onDisconnect = this.callbacks[`dev${deviceId}.disconnect`];
    if (onDisconnect) {
      onDisconnect(deviceId);
      this.callbacks[`dev${deviceId}.disconnect`] = undefined;
    }
    if (device.opened) {
      await device.controlTransferOut({
        'requestType' : 'class',
        'recipient' : 'interface',
        'request' : 0x22,
        'value' : 0x00,
        'index' : ifaceNumber
      });
      await device.close();
    }
  }

  async enableSlotNotifications(deviceId: string, slot: number, cb: SlotSignalCallback): Promise<void> {
    this.callbacks[`dev${deviceId}.slot${slot}.sig`] = cb;
  }

  async disableSlotNotifications(deviceId: string, slot: number): Promise<void> {
    this.callbacks[`dev${deviceId}.slot${slot}.sig`] = undefined;
  }

  async enableSlotMetricsNotifications(deviceId: string, slot: number, cb: (slot: number, metrics: number[]) => void): Promise<void> {
    this.callbacks[`dev${deviceId}.slot${slot}.met`] = cb;
  }

  async disableSlotMetricsNotifications(deviceId: string, slot: number): Promise<void> {
    this.callbacks[`dev${deviceId}.slot${slot}.met`] = undefined;
  }

  async enableUioNotifications(deviceId: string, cb: (state: number[]) => void): Promise<void> {
    this.callbacks[`dev${deviceId}.uio`] = cb;
  }

  async disableUioNotifications(deviceId: string): Promise<void> {
    this.callbacks[`dev${deviceId}.uio`] = undefined;
  }

  async getDeviceBatteryLevel(deviceId: string): Promise<number> {
    return 100;
  }

  async getDeviceStrength(deviceId: string): Promise<number> {
    return 100;
  }

  async getUioState(deviceId: string): Promise<number[]> {
    const device = await this._getDevice(deviceId);
    const deviceState = this.deviceStates[deviceId];
    if (!device || !deviceState) {
      throw new Error(`Device ${deviceId} not found`);
    }
    if (deviceState.uioRequest) {
      throw new Error('A UIO state request is already pending');
    }

    const requestPacket = this.encodePacket(0, PacketType.Uio, []);
    let lastError: Error|undefined;
    for (let attempt = 0; attempt < TIO_USB_UIO_REQUEST_ATTEMPTS; attempt++) {
      try {
        return await new Promise<number[]>((resolve, reject) => {
          const timeout = setTimeout(() => {
            deviceState.uioRequest = undefined;
            reject(new Error('Timed out waiting for UIO state from USB device'));
          }, TIO_USB_UIO_REQUEST_TIMEOUT_MS);
          deviceState.uioRequest = { resolve, reject, timeout };
          device.transferOut(3, requestPacket).catch((error) => {
            clearTimeout(timeout);
            deviceState.uioRequest = undefined;
            reject(error instanceof Error ? error : new Error(String(error)));
          });
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt + 1 < TIO_USB_UIO_REQUEST_ATTEMPTS) {
          await delay(100);
        }
      }
    }
    throw lastError || new Error('Failed reading UIO state from USB device');
  }

  async setUioState(deviceId: string, state: number[]): Promise<void> {

    if (state.length !== 8) {
      console.log(`Invalid state length: ${state.length}`);
      return;
    }
    const device = await this._getDevice(deviceId);
    if (!device) {
      console.log(`Device ${deviceId} not found`);
      return;
    }

    const packet = this.encodePacket(0, PacketType.Uio, state);

    // Send the packet as a single raw bulk OUT transfer (WebUSB's
    // transferOut() spans as many underlying max-packet-size USB
    // transactions as needed automatically -- no application-level framing
    // needed, mirroring how device->host reads already work). Previously
    // this was split into 62-byte chunks with a 2-byte "NS frame header"
    // prepended to every 64-byte transfer, a convention inherited from an
    // older neuralSPOT sample that multiplexed two different message types
    // over one endpoint; TileIO's packets are already self-delimited
    // (start/stop markers + CRC16 + fixed length) and only ever carry one
    // kind of data, so that per-transfer header was pure legacy overhead --
    // 25% larger on the wire (5x 64-byte transfers for one 256-byte
    // packet) and 5 separate transferOut() calls instead of 1 for a single
    // logical write.
    console.log(`Sending UIO state ${state}`);
    await device.transferOut(3, packet);
  }
}

const defaultHandler = new UsbHandler();

export default defaultHandler;
