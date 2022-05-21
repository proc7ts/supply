import { beforeEach, describe, expect, it } from '@jest/globals';
import { SupplyAbortError } from './supply-abort.error.js';

describe('SupplyAbortError', () => {
  describe('name', () => {
    it('is `SupplyAbortError`', () => {
      expect(new SupplyAbortError().name).toBe('SupplyAbortError');
    });
  });

  describe('abortReasonOf', () => {

    let abortCtl: AbortController;
    let signal: AbortSignal;

    beforeEach(() => {
      abortCtl = new AbortController();
      signal = abortCtl.signal;
    });

    it('returns `undefined` for not yet aborted signal', () => {
      expect(SupplyAbortError.abortReasonOf(signal)).toBeUndefined();
    });
    it('returns explicit abort reason', () => {
      const reason = new Error('Aborted by test');

      abortCtl.abort(reason);

      expect(SupplyAbortError.abortReasonOf(signal)).toBe(reason);
    });
    it('returns default abort reason', () => {
      abortCtl.abort();

      expect(SupplyAbortError.abortReasonOf(signal)).toEqual(new SupplyAbortError());
    });
  });
});
