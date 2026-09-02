// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { ISlotConfig } from "../models/slot";

/**
 * Signal delivery callback. `discontinuity` is true when the slot's playout
 * clock re-anchored (stall, dropped backlog or sampling-rate change) and the
 * consumer must break the rendered trace rather than interpolate across it.
 */
export type SlotSignalCallback = (slot: number, signals: number[][], mask: number[][], discontinuity: boolean) => Promise<void>;

export interface ApiHandler {
    initialize(): Promise<boolean>;
    startScan(cb: (deviceId: string, name: string) => boolean): Promise<void>;
    stopScan(): Promise<void>;
    refreshPreviousDevices(deviceIds: string[], cb: (deviceId: string, name: string) => void): Promise<void>;
    refreshPreviousDevice(deviceId: string): Promise<boolean>;
    getConnectedDevices(): Promise<string[]>;
    deviceConnect(deviceId: string, slots: ISlotConfig[], onDisconnect?: (deviceId: string) => void): Promise<void>;
    deviceDisconnect(deviceId: string): Promise<void>;
    enableSlotNotifications(deviceId: string, slot: number, cb: SlotSignalCallback): Promise<void>;
    disableSlotNotifications(deviceId: string, slot: number): Promise<void>;
    enableSlotMetricsNotifications(deviceId: string, slot: number, cb: (slot: number, metrics: number[]) => void): Promise<void>;
    disableSlotMetricsNotifications(deviceId: string, slot: number): Promise<void>;
    enableUioNotifications(deviceId: string, cb: (state: number[]) => void): Promise<void>;
    disableUioNotifications(deviceId: string): Promise<void>;
    getDeviceBatteryLevel(deviceId: string): Promise<number>;
    getDeviceStrength(deviceId: string): Promise<number>;
    getUioState(deviceId: string): Promise<number[]>;
    setUioState(deviceId: string, state: number[]): Promise<void>;
}
