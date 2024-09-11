import { RecordFormat } from '../models/record';
import { IEventMarkerSnapshot } from '../models/event';

export interface RecordData {

  open(): Promise<void>;
  close(): Promise<void>;
  delete(): Promise<void>;

  setEvents(events: IEventMarkerSnapshot[]): Promise<void>;
  setEvent(event: IEventMarkerSnapshot): Promise<void>;

  getSlotSignals(slot: number, start?: number, stop?: number): Promise<number[][]>;
  getSlotMask(slot: number, start?: number, stop?: number): Promise<number[][]>;
  getSlotMetrics(slot: number, start?: number, stop?: number): Promise<number[][]>;

  getEvents(start?: number, stop?: number): Promise<IEventMarkerSnapshot[]>;

  getSlotSignalsLength(slot: number): Promise<number>;
  getSlotMaskLength(slot: number): Promise<number>;
  getSlotMetricsLength(slot: number): Promise<number>;
  getEventsLength(): Promise<number>;

  addSlotSignals(slot: number, signals: number[][]): Promise<void>;
  addSlotMask(slot: number, mask: number[][]): Promise<void>;
  addSlotMetrics(slot: number, metrics: number[][]): Promise<void>;
  addEvent(event: IEventMarkerSnapshot): Promise<void>;

  deleteEvent(ts: number): Promise<void>;

  generateUri(date: Date, duration: number, format: RecordFormat): Promise<string>;
}
