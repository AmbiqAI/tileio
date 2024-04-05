/// <reference types="w3c-web-usb" />

// import { ApiManager } from "./api";
// import { IDeviceInfo } from '../models/deviceInfo';


export default {};

// class UsbManager implements ApiManager {

//   initialized: boolean;
//   deviceInfo: Record<string, IDeviceInfo|undefined>;
//   callbacks: Record<string, any>;
//   _devices: USBDevice[];

//   constructor() {
//     this.initialized = false;
//     this.deviceInfo = {};
//     this.callbacks = {};
//     this._devices = [];
//   }

//   async initialize(): Promise<boolean> {
//     // return navigator.usb.getDevices().then(devices => {
//     //   console.log(devices);
//     //   return true;
//     // });
//     navigator.usb.getDevices
//     this.initialized = true;
//     return true;
//   }

//   async startScan(cb: (deviceId: string, name: string) => boolean): Promise<void> {
//     await this.initialize();
//     let done = false;
//     this._devices = await navigator.usb.getDevices();
//     this._devices.forEach(device => {
//       const deviceId = device.serialNumber || `${device.productId}`;
//       const deviceName = device.productName || `${device.vendorId}:${device.productId}`;
//       done = cb(deviceId, deviceName);
//     });
//   }

//   async stopScan(): Promise<void> {
//   }

//   async refreshPreviousDevices(deviceIds: string[], cb: (deviceId: string, name: string) => void): Promise<void> {
//     await this.initialize();
//     let done = false;
//     this.startScan((deviceId, name) => {
//       if (deviceIds.includes(deviceId)) {
//         cb(deviceId, name);
//       }
//       return done;
//     });
//   }

//   async refreshPreviousDevice(deviceId: string): Promise<boolean> {
//     this.refreshPreviousDevices([deviceId], (deviceId, name) => {
//       this.callbacks[deviceId]();
//     });
//     return true;
//   }

//   async getConnectedDevices(): Promise<string[]> {
//     return this._devices.map(device => device.serialNumber || `${device.productId}`);
//   }

//   async deviceConnect(deviceId: string, deviceInfo: IDeviceInfo, onDisconnect?: (deviceId: string) => void): Promise<void> {
//     this.deviceInfo[deviceId] = deviceInfo;
//     this.callbacks[deviceId] = onDisconnect;
//     // Get device by serial number
//     const device = this._devices.find(device => device.serialNumber === deviceId);
//     if (device) {
//       // Open device
//       await device.open();
//       // Select configuration
//       await device.selectConfiguration(1);
//       // Claim interface
//       await device.claimInterface(0);
//     }
//   }

// }
