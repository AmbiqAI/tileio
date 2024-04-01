import React from 'react';
import { unprotect } from 'mobx-state-tree';
import { Storage, Drivers } from '@ionic/storage';
import { Root, IRoot } from './root';
import persist from '../utils/persist';

const TIO_STORAGE_KEY = '__tio_store';

const root = Root.create({
  devices: [],
  records: [],
  settings: {}
});

const store = {
  root
};

const storage = new Storage({
  name: TIO_STORAGE_KEY,
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});


storage.create().then(() => {
  persist('rootStore', root, storage, {
    jsonify: true,
    whitelist: ['devices', 'records', 'settings']
  }).then(() => {
    store.root.initialize();
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
