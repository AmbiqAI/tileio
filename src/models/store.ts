import React from 'react';
import { unprotect } from 'mobx-state-tree';
import { Storage, Drivers } from '@ionic/storage';
import { Root, IRoot } from './root';
import persist from '../utils/persist';

const root = Root.create({
  devices: [],
  records: [],
  settings: {}
});

const store = {
  root
};

const storage = new Storage({
  name: '__pk_store_dbg',
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});


storage.create().then(() => {
  persist('rootStore', root, storage, {
    jsonify: true,
    whitelist: ['devices', 'records', 'settings']
  });
});


unprotect(root);
 // @ts-ignore
window.store = store;

export const StoreContext = React.createContext(store);
export const useStore = () => React.useContext(StoreContext);
export default store;

export type IStore = {
  root: IRoot
}
