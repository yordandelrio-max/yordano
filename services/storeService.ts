
import { Store } from '../types';
import { INITIAL_STORES } from '../constants';

const STORAGE_KEY = 'geofinder_stores';

export const storeService = {
  getStores: (): Store[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORES));
      return INITIAL_STORES;
    }
    return JSON.parse(stored);
  },

  saveStore: (store: Store): void => {
    const stores = storeService.getStores();
    const index = stores.findIndex(s => s.id === store.id);
    if (index >= 0) {
      stores[index] = store;
    } else {
      stores.push(store);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
  },

  deleteStore: (id: string): void => {
    const stores = storeService.getStores();
    const filtered = stores.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
