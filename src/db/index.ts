import { IDeviceInfo } from '../models/deviceInfo';
import { RecordData } from './record';
import { SqlRecordData, deleteSqlRecordData, initSqlDB, closeSqlDB } from './sqliteDb';

export async function initDB() {
  await initSqlDB();
}

export async function closeDB() {
  await closeSqlDB();
}

export async function createRecordData(name: string, deviceInfo: IDeviceInfo): Promise<RecordData> {
  return new SqlRecordData(name, deviceInfo);
}

export async function deleteRecordData(name: string): Promise<void> {
  await deleteSqlRecordData(name);
}
