import { beforeEach, describe, expect, it } from '@jest/globals';
import { SupplyAbortError } from './supply-abort.error.js';

describe('SupplyAbortError', () => {
  describe('name', () => {
    it('is `SupplyAbortError`', () => {
      expect(new SupplyAbortError().name).toBe('SupplyAbortError');
    });
  });

  describe('reasonOf', () => {
    let abortCtl: AbortController;
    let signal: AbortSignal;

    beforeEach(() => {
      abortCtl = new AbortController();
      signal = abortCtl.signal;
    });

    it('returns `undefined` for not yet aborted signal', () => {
      expect(SupplyAbortError.reasonOf(signal)).toBeUndefined();
    });
    it('returns explicit abort reason', () => {
      const reason = new Error('Aborted by test');

      abortCtl.abort(reason);

      expect(SupplyAbortError.reasonOf(signal)).toBe(reason);
    });
    it('returns default abort reason', () => {
      abortCtl.abort();

      expect(SupplyAbortError.reasonOf(signal)).toEqual(new SupplyAbortError());
    });
  });
});
