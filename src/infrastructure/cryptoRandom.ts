import type { RandomSource } from '../ports';

const RANGE = 2 ** 32;

export const cryptoRandom: RandomSource = {
  next() {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0]! / RANGE;
  },
};
