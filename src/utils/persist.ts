import { Storage } from '@ionic/storage'
import { onSnapshot, applySnapshot, IStateTreeNode } from 'mobx-state-tree'

export interface IArgs {
  (
    name: string,
    store: IStateTreeNode,
    storage: Storage,
    options?: IOptions): Promise<void>
}
export interface IOptions {
  storage?: any,
  jsonify?: boolean,
  readonly whitelist?: Array<string>,
  readonly blacklist?: Array<string>
}
type StrToAnyMap = {[key: string]: any}

export const persist: IArgs = (name, store, storage, options = {}) => {
  const {jsonify = true, whitelist, blacklist} = options;
  const whitelistDict = arrToDict(whitelist);
  const blacklistDict = arrToDict(blacklist);

  // onSnapshot(store, async (_snapshot: StrToAnyMap) => {
  //   const snapshot = { ..._snapshot };
  //   Object.keys(snapshot).forEach((key) => {
  //     if (whitelist && !whitelistDict[key]) { delete snapshot[key]; }
  //     if (blacklist && blacklistDict[key]) { delete snapshot[key]; }
  //   });
  //   const data = !jsonify ? snapshot : JSON.stringify(snapshot)
  //   await storage.set(name, data);
  // })

  return storage.get(name)
    .then((data: object | string) => {
      const snapshot = !isString(data) ? data : JSON.parse(data)
      // don't apply falsey (which will error), leave store in initial state
      if (snapshot) {
        applySnapshot(store, snapshot)
      }
      onSnapshot(store, async (_snapshot: StrToAnyMap) => {
        const snapshot = { ..._snapshot };
        Object.keys(snapshot).forEach((key) => {
          if (whitelist && !whitelistDict[key]) { delete snapshot[key]; }
          if (blacklist && blacklistDict[key]) { delete snapshot[key]; }
        });
        const data = !jsonify ? snapshot : JSON.stringify(snapshot)
        await storage.set(name, data);
      })
    })
}

type StrToBoolMap = {[key: string]: boolean};

function arrToDict (arr?: Array<string>): StrToBoolMap {
  if (!arr) { return {} }
  return arr.reduce((dict: StrToBoolMap, elem) => {
    dict[elem] = true
    return dict
  }, {});
}

function isString (value: any): value is string {
  return typeof value === 'string';
}

export default persist;
