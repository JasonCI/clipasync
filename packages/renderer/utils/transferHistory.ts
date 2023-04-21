import {ReceiveLRU, SendLRU} from './LRU';

export const useSendHistory = (maxLen: number, storeMap = null) => {
  const lru = new SendLRU(maxLen, storeMap);
  const map = lru.getMap();
  return {
    map,
    set: lru.set.bind(lru),
    get: lru.get.bind(lru),
  };
};

export const useReceiveHistory = (maxLen: number, storeMap = null) => {
  const lru = new ReceiveLRU(maxLen, storeMap);
  const map = lru.getMap();
  return {
    map,
    set: lru.set.bind(lru),
    get: lru.get.bind(lru),
  };
};


