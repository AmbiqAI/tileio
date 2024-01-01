import {v4 as uuidv4} from 'uuid';
import { types } from 'mobx-state-tree';

// Utility type for using json string dates
export const JsonStringDate = types.custom<string, Date>({
  name: 'JsonDate',
  isTargetType: value => {
    return value instanceof Date;
  },
  getValidationMessage(value) {
    return '';
  },
  fromSnapshot(value) {
    return new Date(value);
  },
  toSnapshot(value) {
    return value.toJSON();
  }
});

export function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}

export function formatDate(date: Date): string {
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();
  let year = date.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;
  return [month, day, year].join('/');
}

export function uuid4(): string {
  return uuidv4();
}

export function delay<Type>(t: number, val?: Type): Promise<Type|undefined> {
  return new Promise(function(resolve) {
      setTimeout(function() {
          resolve(val);
      }, t);
  });
}

export function formatDurationHMS(duration: number) {
  // Hours, minutes and seconds
  let hrs = ~~(duration / 3600);
  let mins = ~~((duration % 3600) / 60);
  let secs = ~~duration % 60;
  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";
  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}
