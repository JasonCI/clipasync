import {nanoid} from 'nanoid';

export const getDeviceId = (len = 6) => {
  return nanoid().slice(0, len).toUpperCase();
};
