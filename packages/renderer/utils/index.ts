
export const getPeerId = (len = 6) => {
  return String((Math.random() * 10e16) ).slice(0, len);
};




