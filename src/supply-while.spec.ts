import { describe, expect, it } from '@jest/globals';
import { supplyWhile } from './supply-while.js';

describe('supplyWhile', () => {
  it('completes supply on promise resolution', async () => {
    await expect(supplyWhile(Promise.resolve(123)).whenDone()).resolves.toBe(123);
  });
  it('aborts supply on promise rejection', async () => {
    await expect(supplyWhile(Promise.reject('error')).whenDone()).rejects.toBe('error');
  });
  it('aborts supply on reasonless promise rejection', async () => {
    await expect(supplyWhile(Promise.reject()).whenDone()).rejects.toBeUndefined();
  });
});
