import { unparse } from 'papaparse';
import { Filesystem, Directory, Encoding, ReadFileOptions } from '@capacitor/filesystem';
import { CapacitorSQLite, capSQLiteSet, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { IDeviceInfo, IDeviceInfoSnapshot } from '../models/deviceInfo';
import { RecordFormat } from '../models/record';
import { IEventMarkerSnapshot } from '../models/event';
import { RecordData } from './record';
import { Capacitor } from '@capacitor/core';
import { openDB } from 'idb';

function sqlSlotSignalsTableStr(slot: number, chs: number) {
  return [
    `CREATE TABLE IF NOT EXISTS signals${slot} (`,
    '  ts INTEGER NOT NULL PRIMARY KEY,',
    `${Array(chs).fill(0).map((_, i) => `  ch${i} REAL`).join(',\n')}`,
    ');',
  ].join('\n');
}

function sqlSlotMaskTableStr(slot: number) {
  return [
    `CREATE TABLE IF NOT EXISTS mask${slot} (`,
    '  ts INTEGER NOT NULL PRIMARY KEY,',
    '  mask REAL',
    ');',
  ].join('\n');
}


function sqlSlotMetricsTableStr(slot: number, metrics: number) {
  return [
    `CREATE TABLE IF NOT EXISTS metrics${slot} (`,
    '  ts INTEGER NOT NULL PRIMARY KEY,',
    `  ${Array(metrics).fill(0).map((_, i) => `met${i} REAL`).join(',\n')}`,
    ');',
  ].join('\n');
}

function sqlEventsTableStr() {
  return [
  'CREATE TABLE IF NOT EXISTS events (',
  '  ts INTEGER NOT NULL PRIMARY KEY,',
  '  name TEXT',
  ');',
  ].join('\n');
}

function sqlDeviceTableStr() {
  return [
  'CREATE TABLE IF NOT EXISTS device (',
  '  name TEXT',
  '  location TEXT',
  ');',
  ].join('\n');
}


let _sqlite: SQLiteConnection|undefined = undefined;

async function getSqlite(): Promise<SQLiteConnection> {
  if (!_sqlite) {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const platform = Capacitor.getPlatform();
    if (platform === "web") {
      await sqlite.initWebStore();
    }
    _sqlite = sqlite;
  }
  return _sqlite;
}

async function createConnection(name: string): Promise<SQLiteDBConnection> {
  const sqlite = await getSqlite();
  if ((await sqlite.isConnection(name, false)).result) {
    console.debug(`Using existing connection for ${name}`);
    const db = await sqlite.retrieveConnection(name, false);
    if (!(await db.isDBOpen()).result) {
      await db.open();
    }
    return db;
  } else {
    console.debug(`Using new connection for ${name}`);
    const db =  await sqlite.createConnection(name, false, "no-encryption", 1, false);
    await db.open();
    return db;
  }
}

async function closeConnection(name: string, db?: SQLiteDBConnection) {
  const sqlite = await getSqlite();
  if ((await sqlite.isConnection(name, false)).result) {
    if (db && (await db.isDBOpen()).result) {
      await db.close();
    }
    await sqlite.closeConnection(name, false);
  }
}

export async function initSqlDB() {
}

export async function closeSqlDB() {
  const sqlite = await getSqlite();
  await sqlite.closeAllConnections();
}


export async function deleteSqlRecordData(name: string): Promise<void> {
  let db: SQLiteDBConnection|undefined = undefined;
  try {
    db = await createConnection(name);
    let ret = await db.isExists();
    if(ret.result) {
      await db.delete();
    }
  } catch (err) {
    return Promise.reject(err);
  } finally {
    await closeConnection(name, db);
  }
}

export class SqlRecordData implements RecordData {
  name: string
  _db?: SQLiteDBConnection
  deviceInfo: IDeviceInfo;

  constructor(name: string, deviceInfo: IDeviceInfo) {
    this.name = name;
    this.deviceInfo = deviceInfo;
  }

  async db(): Promise<SQLiteDBConnection> {
    if (!this._db) {
      this._db = await createConnection(this.name);
    }
    if (!(await this._db!.isDBOpen()).result) {
      await this._db.open();
    }
    return this._db!;
  }

  async open() {
    await this.initialize();
  }

  async initialize() {
    const db = await this.db();
    for (let i = 0; i < this.deviceInfo.slots.length; i++) {
      const slot = this.deviceInfo.slots[i];
      await db.execute(sqlSlotSignalsTableStr(i, slot.chs.length));
      await db.execute(sqlSlotMaskTableStr(i));
      await db.execute(sqlSlotMetricsTableStr(i, slot.metrics.length));
    }
    await db.execute(sqlEventsTableStr());
    await db.execute(sqlDeviceTableStr());
  }

  async close() {
    await this._save();
    await closeConnection(this.name, this._db);
    this._db = undefined;
  }

  async delete(): Promise<void> {
    await deleteSqlRecordData(this.name);
    await this.close();
  }

  async _save(): Promise<void> {
    const platform = Capacitor.getPlatform();
    const sqlite = await getSqlite();
    if (platform === "web") {
      sqlite.saveToStore(this.name);
    }
  }

  async setDeviceInfo(device: IDeviceInfoSnapshot): Promise<void> {
    const db = await this.db();
    await db.run("DELETE FROM device;");
    await db.run(
      "INSERT INTO device VALUES (?, ?);",
      [device.name, device.location]
    );
    await this._save();
  }

  async addSlotSignals(slot: number, signals: number[][]): Promise<void> {
    const numCols = this.deviceInfo.slots[slot].chs.length + 1; // ts + chs
    const db = await this.db();
    const dbSet: capSQLiteSet[] = signals.map((row) => ({
      statement: `INSERT INTO signals${slot} VALUES (${Array(numCols).fill('?').join(', ')});`,
      values: row
    }));
    try {
      await db.executeSet(dbSet);
    } catch (error) {
      console.error(error);
    }
  }

  async addSlotMask(slot: number, mask: number[][]): Promise<void> {
    const db = await this.db();
    const dbSet: capSQLiteSet[] = mask.map((row) => ({
      statement: `INSERT INTO mask${slot} VALUES (?, ?);`,
      values: row
    }));
    try {
      await db.executeSet(dbSet);
    } catch (error) {
      console.error(error);
    }
  }

  async addSlotMetrics(slot: number, metrics: number[][]): Promise<void> {
    const numCols = this.deviceInfo.slots[slot].metrics.length + 1; // ts + chs
    const db = await this.db();
    const dbSet: capSQLiteSet[] = metrics.map((row) => ({
      statement: `INSERT INTO metrics${slot} VALUES (${Array(numCols).fill('?').join(', ')});`,
      values: row
    }));
    try {
      await db.executeSet(dbSet);
    } catch (error) {
      console.error(error);
    }
  }

  async addEvent(event: IEventMarkerSnapshot): Promise<void> {
    const db = await this.db();
    try {
      await db.run(
        "INSERT INTO events VALUES (?, ?);",
        [event.ts, event.name]
      );
    } catch (error) {
      console.error(error);
    }
  }

  async setEvents(events: IEventMarkerSnapshot[]): Promise<void> {
    const db = await this.db();
    await db.run("DELETE FROM events;");
    for (const event of events) {
      await this.addEvent(event);
    }
    await this._save();
  }

  async setEvent(event: IEventMarkerSnapshot): Promise<void> {
    const db = await this.db();
    await db.run(
      "UPDATE events SET name = ? WHERE ts = ?",
      [event.ts, event.name]
    )
    await this._save();
  }

  async _getTableCount(table: string): Promise<number> {
    const db = await this.db();
    const rst = await db.query(`SELECT COUNT(*) as cnt from ${table};`);
    return !!rst.values && rst.values.length > 0 ? parseInt(rst.values[0].cnt) : 0;
  }

  async _getTableRowsForTsRange<Type>(table: string, start: number = 0, stop: number = Number.MAX_SAFE_INTEGER): Promise<Type[]> {
    const db = await this.db();
    const limit = 500_000;
    const rst = await db.query(`SELECT * from ${table} WHERE ts >= ${start} AND ts <= ${stop} LIMIT ${limit};`);
    return rst.values ? rst.values! : [];
  }

  async _getTableRows<Type>(table: string, offset: number = 0, length: number = 1): Promise<Type[]> {
    const db = await this.db();
    const rst = await db.query(`SELECT * from ${table} LIMIT ${length} OFFSET ${offset};`);
    return rst.values ? rst.values! : [];
  }

  async getSlotSignalsLength(slot: number): Promise<number> {
    return await this._getTableCount(`signals${slot}`);
  }

  async getSlotMaskLength(slot: number): Promise<number> {
    return await this._getTableCount(`mask${slot}`);
  }

  async getSlotMetricsLength(slot: number): Promise<number> {
    return await this._getTableCount(`metrics${slot}`);
  }

  async getEventsLength(): Promise<number> {
    return await this._getTableCount('events');
  }

  async getDeviceInfo(): Promise<IDeviceInfoSnapshot> {
    const devices = (await this._getTableRows('device', 0, 1)) as IDeviceInfoSnapshot[];
    if (devices.length === 0) { throw Error('No device found in record table'); }
    return devices[0];
  }

  async getSlotSignals(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRowsForTsRange<{[key: string]: number}>(`signals${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getSlotMask(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRowsForTsRange<{[key: string]: number}>(`mask${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getSlotMetrics(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRowsForTsRange<{[key: string]: number}>(`metrics${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getEvents(start?: number, stop?: number): Promise<IEventMarkerSnapshot[]> {
    return await this._getTableRowsForTsRange<IEventMarkerSnapshot>('events', start, stop);
  }

  async getSlotSignalsRows(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRows<{[key: string]: number}>(`signals${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getSlotMaskRows(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRows<{[key: string]: number}>(`mask${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getSlotMetricsRows(slot: number, start?: number, stop?: number): Promise<number[][]> {
    const rst = await this._getTableRows<{[key: string]: number}>(`metrics${slot}`, start, stop);
    return rst.map(row => Object.values(row));
  }

  async getEventsRows(start?: number, stop?: number): Promise<IEventMarkerSnapshot[]> {
    return await this._getTableRows<IEventMarkerSnapshot>('events', start, stop);
  }

  async deleteEvent(ts: number): Promise<void> {
    const db = await this.db();
    await db.run("DELETE from events WHERE ts = ?", [ts])
  }

  async tableToCsv(getRows: (i: number, len: number) => Promise<{}[]>, columns: string[], num_rows: number, fileOptions: ReadFileOptions) {
    const BLOCK_SIZE = 1024;
    for (let r = 0; r < num_rows; r += BLOCK_SIZE) {
      const len = Math.min(BLOCK_SIZE, num_rows - r);
      const lastBlock = (r + BLOCK_SIZE > num_rows);
      await Filesystem.appendFile({
        data: unparse(
          await getRows(r, len),
          {delimiter: ',', newline: '\n', header: (r === 0), columns: columns}
        ) + '\n'.repeat(lastBlock ? 2 : 1),
        ...fileOptions
      });
    }
  };
  async generateUri(date: Date, duration: number, device: IDeviceInfoSnapshot, format: RecordFormat): Promise<string> {

    const platform = Capacitor.getPlatform();

    if (format === RecordFormat.Sqlite) {
      // On web, sqlite is stored in indexedDB
      if (platform === 'web') {
        const db = await openDB('jeepSqliteStore');
        const store = db.transaction('databases').objectStore('databases');
        const data = await store.get(`${this.name}SQLite.db`);
        const rst = await Filesystem.writeFile({
          data: data,
          recursive: true,
          encoding: Encoding.UTF8,
          path: 'record.sqlite',
          directory: Directory.Cache
        });
        return rst.uri;
      } else {
        const db = await this.db();
        const uri = (await db.getUrl()).url;
        if (uri) { return uri;  }
      }
    }

    const fileOptions = {
      path: 'record.csv',
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    };
    await Filesystem.writeFile({
      data: '',
      recursive: true,
      ...fileOptions
    });

    // Record: name, date, duration
    const recordRow = {record: this.name, startDate: date.toLocaleDateString(), startTime: date.toLocaleTimeString(), duration: duration};
    await this.tableToCsv(async () => [recordRow], ['record', 'startDate', 'startTime', 'duration'], 1, fileOptions);

    // Device: name, location
    await this.tableToCsv(async () => [await this.getDeviceInfo.bind(this)()], ['name', 'location'], 1, fileOptions);
    await this.tableToCsv(async () => [device.name, device.location], ['name', 'location'], 1, fileOptions);
    // Events
    await this.tableToCsv(this.getEventsRows.bind(this), ['ts', 'name'], await this.getEventsLength(), fileOptions);

    // Slots
    for (let i = 0; i < this.deviceInfo.slots.length; i++) {
      const slot = this.deviceInfo.slots[i];
      await this.tableToCsv(this.getSlotSignalsRows.bind(this, i), ['ts'].concat(slot.chs), await this.getSlotSignalsLength(i), fileOptions);
      await this.tableToCsv(this.getSlotMaskRows.bind(this, i), ['ts', 'mask'], await this.getSlotMaskLength(i), fileOptions);
      await this.tableToCsv(this.getSlotMetricsRows.bind(this, i), ['ts'].concat(slot.metrics), await this.getSlotMetricsLength(i), fileOptions);
    }

    return (await Filesystem.getUri({
      path: fileOptions.path,
      directory: fileOptions.directory
    })).uri;

  }
}
