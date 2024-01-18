import { ApiManager } from './api';
import BleManager from './ble';
import EmulatorManager from './dummy';

export enum ApiModeType {
  ble = "ble",
  emulate = "emulate",
}


let apiMode = ApiModeType.emulate as ApiModeType | undefined;

export function initApi(mode: ApiModeType) {
  console.log(`Initializing API in ${mode} mode`);
  apiMode = mode;
}

export function getApi(): ApiManager {
  if (apiMode === ApiModeType.emulate) {
    return EmulatorManager;
  } else {
    return BleManager;
  }
}

export { default as Notifier } from './Notifier';
