import { IDeviceInfo, IDeviceInfoSnapshot } from "../models/deviceInfo";
import { DeviceInterfaceType } from "../models/types";
import { delay } from "../utils";
import { BleHandler } from "./ble";
import { EmulatorHandler } from "./dummy";
import { ApiHandler } from "./handler";
import { ApiModeType } from "./types";
import { UsbHandler } from "./usb";

export class ApiManager {

  devices: Record<string, IDeviceInfoSnapshot>;
  handlers: Record<DeviceInterfaceType, ApiHandler|undefined>;
  initialized: boolean;

  constructor() {
    this.devices = {};
    this.initialized = false;
    this.handlers = {
      [DeviceInterfaceType.ble]: undefined,
      [DeviceInterfaceType.usb]: undefined
    };
  }

  async initialize(mode: ApiModeType): Promise<boolean> {
    /**
     * Initialize the API manager with the appropriate handlers
     * @param mode API mode (emulate or real)
     * @returns True if initialization was successful
     */
    if (this.initialized) {
      return true;
    }
    console.info('Initializing API manager');
    if (await BleHandler.supportedPlatform() || mode === ApiModeType.emulate) {
      console.info('BLE supported');
      this.handlers[DeviceInterfaceType.ble] = mode === ApiModeType.emulate ? new EmulatorHandler() : new BleHandler();
    }
    if (await UsbHandler.supportedPlatform() || mode === ApiModeType.emulate) {
      console.info('USB supported');
      this.handlers[DeviceInterfaceType.usb] = mode === ApiModeType.emulate ? new EmulatorHandler() : new UsbHandler();
    }
    return true;
  }

  getDeviceHandler(deviceId: string, deviceInfo?: IDeviceInfo): ApiHandler {
    /**
     * Get the handler for a device
     * @param deviceId Device ID
     * @param deviceInfo Device information (optional)
     * @returns Handler for the device
     */
    if (deviceInfo) {
      this.devices[deviceId] = deviceInfo;
    }
    let deviceInfoSnapshot = this.devices[deviceId];
    if (!deviceInfoSnapshot || !deviceInfoSnapshot.type) {
      throw new Error(`Device ${deviceId} not found`);
    }
    const handler = this.handlers[deviceInfoSnapshot.type];
    if (!handler) {
      throw new Error(`Handler for ${deviceInfoSnapshot.type} not found`);
    }
    return handler;
  }

  async scan(cb: (deviceId: string, name: string, type: DeviceInterfaceType) => boolean, timeout: number): Promise<void> {
    /**
     * Perform scan on all handlers to discover new devices
     * @param cb Callback function to be called when a device is found
     * @param timeout Timeout in milliseconds per handler
     */

    // Scan for devices on all handlers one by one (some platforms require user interaction to start scanning)
    let numScans = 0;
    for await (const [stype, handler] of Object.entries(this.handlers)) {
      const handlerType = stype as DeviceInterfaceType;
      let done = false;
      if (handler === undefined) {
        continue;
      }
      await handler.startScan((deviceId: string, name: string) => {
        let deviceInfo = this.devices[deviceId];
        if (!deviceInfo) {
          deviceInfo = { id: deviceId, name: name, type: handlerType };
          this.devices[deviceId] = deviceInfo;
        }
        deviceInfo.name = name;
        deviceInfo.type = handlerType;
        done = cb(deviceId, name, handlerType);
        return done;
      });
      numScans++;
      const start = Date.now();
      while (!done && Date.now() - start < timeout) {
        await delay(100);
      };
      if (!done) {
        await handler.stopScan();
      }
    }
    if (numScans === 0) {
      console.warn('No interfaces available on platform');
      throw new Error('No interfaces available on platform');
    }
  }

  async refreshPreviousDevices(deviceInfos: IDeviceInfo[], cb: (deviceId: string, name: string) => void): Promise<void> {
    /**
     * Refresh previous devices.
     * On BLE, this will scan and find intersection of previous devices
     * On USB, this will find all connected devices
     * For web, we can only get a single device at a time...assume available and handle when user tries to connect
     */
    let numScans = 0;
    for await (const handlerType of Object.values(DeviceInterfaceType)) {
      const handler = this.handlers[handlerType];
      if (handler === undefined) { continue; }
      numScans++;
      const deviceIds = deviceInfos.filter(d => d.type === handlerType).map(d => d.id);
      await handler.refreshPreviousDevices(deviceIds, cb);
    }
    if (numScans === 0) {
      console.warn('No interfaces available on platform');
      throw new Error('No interfaces available on platform');
    }

  }

  async refreshPreviousDevice(deviceInfo: IDeviceInfo): Promise<boolean> {
    /**
     * Refresh a single device by ID to check if it is still available
     * @param deviceInfo Device information
     * @returns True if the device is still available
     */
    const handler = this.getDeviceHandler(deviceInfo.id, deviceInfo);
    return await handler.refreshPreviousDevice(deviceInfo.id);
  }

  async deviceConnect(deviceId: string, deviceInfo: IDeviceInfo, onDisconnect?: (deviceId: string) => void): Promise<void> {
    /**
     * Connect to a device
     * @param deviceId Device ID
     * @param deviceInfo Device information
     * @param onDisconnect Callback function to be called when the device is disconnected
     */
    const handler = this.getDeviceHandler(deviceId, deviceInfo);
    await handler.deviceConnect(deviceId, deviceInfo, onDisconnect);
  }

  async deviceDisconnect(deviceId: string): Promise<void> {
    /**
     * Disconnect from a device
     * @param deviceId Device ID
     */
    const handler = this.getDeviceHandler(deviceId);
    await handler.deviceDisconnect(deviceId);
  }

  async enableSlotNotifications(deviceId: string, slot: number, cb: (slot: number, signals: number[][], mask: number[][]) => Promise<void>): Promise<void> {
    /**
     * Enable slot notifications for device
     * @param deviceId Device ID
     * @param slot Slot number
     * @param cb Callback function to be called when a notification is received
     */
    const handler = this.getDeviceHandler(deviceId);
    await handler.enableSlotNotifications(deviceId, slot, cb);
  }

  async disableSlotNotifications(deviceId: string, slot: number): Promise<void> {
    /**
     * Disable slot notifications for device
     * @param deviceId Device ID
     * @param slot Slot number
     */
    const handler = this.getDeviceHandler(deviceId);
    await handler.disableSlotNotifications(deviceId, slot);
  }

  async disableSlotsNotifications(deviceId: string, slots: number[]): Promise<void> {
    /**
     * Disable slot notifications for multiple slots
     * @param deviceId Device ID
     * @param slots Slot numbers
     */
    for (const slot of slots) {
      await this.disableSlotNotifications(deviceId, slot);
    }
  }

  async enableSlotMetricsNotifications(deviceId: string, slot: number, cb: (slot: number, metrics: number[]) => void): Promise<void> {
    /**
     * Enable slot metrics notifications for device
     * @param deviceId Device ID
     * @param slot Slot number
     * @param cb Callback function to be called when a notification is received
     */
    const handler = this.getDeviceHandler(deviceId);
    await handler.enableSlotMetricsNotifications(deviceId, slot, cb);
  }

  async disableSlotMetricsNotifications(deviceId: string, slot: number): Promise<void> {
    /**
     * Disable slot metrics notifications for device
     * @param deviceId Device ID
     * @param slot Slot number
     */
    const handler = this.getDeviceHandler(deviceId);
    await handler.disableSlotMetricsNotifications(deviceId, slot);
  }

  async disableSlotsMetricsNotifications(deviceId: string, slots: number[]): Promise<void> {
    /**
     * Disable slot metrics notifications for multiple slots
     * @param deviceId Device ID
     * @param slots Slot numbers
     */
    for (const slot of slots) {
      await this.disableSlotMetricsNotifications(deviceId, slot);
    }
  }

  async enableUioNotifications(deviceId: string, cb: (state: number[]) => void): Promise<void> {
    /**
     * Enable UIO notifications for device
     * @param deviceId Device ID
     * @param cb Callback function to be called when a notification is received
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.enableUioNotifications(deviceId, cb);
  }

  async disableUioNotifications(deviceId: string): Promise<void> {
    /**
     * Disable UIO notifications for device
     * @param deviceId Device ID
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.disableUioNotifications(deviceId);
  }

  async getDeviceBatteryLevel(deviceId: string): Promise<number> {
    /**
     * Get the battery level of a device
     * @param deviceId Device ID
     * @returns Battery level in percentage
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.getDeviceBatteryLevel(deviceId);
  }

  async getDeviceStrength(deviceId: string): Promise<number> {
    /**
     * Get the signal strength of a device
     * @param deviceId Device ID
     * @returns Signal strength in dBm
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.getDeviceStrength(deviceId);
  }

  async getUioState(deviceId: string): Promise<number[]> {
    /**
     * Get the UIO state of a device
     * @param deviceId Device ID
     * @returns UIO state
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.getUioState(deviceId);
  }

  async setUioState(deviceId: string, state: number[]): Promise<void> {
    /**
     * Set the UIO state of a device
     * @param deviceId Device ID
     * @param state UIO state
     */
    const handler = this.getDeviceHandler(deviceId);
    return await handler.setUioState(deviceId, state);
  }
}

const defaultManager = new ApiManager();
export default defaultManager;
