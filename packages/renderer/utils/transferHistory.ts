import {LRU} from './LRU';

export const userTransferHistory = (maxLen: number, storeMap = null) => {
  const lru = new LRU(maxLen, storeMap);
  console.log('lru', storeMap);
  const map = lru.getMap();
  return {
    map,
    set: lru.set.bind(lru),
    get: lru.get.bind(lru),
  };
};


