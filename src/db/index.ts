import { ISlotConfig } from '../models/slot';
import { RecordData } from './record';
import { SqlRecordData, deleteSqlRecordData, initSqlDB, closeSqlDB } from './sqliteDb';

export async function initDB() {
  await initSqlDB();
}

export async function closeDB() {
  await closeSqlDB();
}

export async function createRecordData(name: string, slots: ISlotConfig[]): Promise<RecordData> {
  return new SqlRecordData(name, slots);
}

export async function deleteRecordData(name: string): Promise<void> {
  await deleteSqlRecordData(name);
}
