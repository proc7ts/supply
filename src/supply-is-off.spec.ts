import { describe, expect, it } from '@jest/globals';
import { SupplyIsOff } from './supply-is-off.js';

describe('SupplyIsOff', () => {
  it('is successful by default', () => {

    const isOff = new SupplyIsOff();

    expect(isOff.failed).toBe(false);
    expect(isOff.error).toBeUndefined();
    expect(isOff.result).toBeUndefined();
  });
  it('is successful when error is not specified', () => {

    const isOff = new SupplyIsOff({});

    expect(isOff.failed).toBe(false);
    expect(isOff.error).toBeUndefined();
    expect(isOff.result).toBeUndefined();
  });
  it('ignores error if successful', () => {

    const isOff = new SupplyIsOff({ failed: false, error: 'error' } as SupplyIsOff.AnyInit as SupplyIsOff.SuccessInit);

    expect(isOff.failed).toBe(false);
    expect(isOff.error).toBeUndefined();
  });
  it('is faulty if error specified', () => {

    const isOff = new SupplyIsOff({ error: 'error' });

    expect(isOff.failed).toBe(true);
    expect(isOff.error).toBe('error');
    expect(isOff.result).toBeUndefined();
  });
  it('is faulty if explicitly set and error omitted', () => {

    const isOff = new SupplyIsOff({ failed: true, error: undefined });

    expect(isOff.failed).toBe(true);
    expect(isOff.error).toBeUndefined();
    expect(isOff.result).toBeUndefined();
  });

  describe('derivation', () => {
    it('derives faulty state and error', () => {

      const base = new SupplyIsOff({ error: 'test error' });
      const derived = new SupplyIsOff(base, {});

      expect(derived.failed).toBe(true);
      expect(derived.error).toBe('test error');
      expect(derived.result).toBeUndefined();
    });
    it('derives successful state', () => {

      const base = new SupplyIsOff({});
      const derived = new SupplyIsOff(base, {});

      expect(derived.failed).toBe(false);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBeUndefined();
    });
    it('derives result', () => {

      const base = new SupplyIsOff({ result: 1 });
      const derived = new SupplyIsOff(base, {});

      expect(derived.failed).toBe(false);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBe(1);
    });
    it('overrides faulty state', () => {

      const base = new SupplyIsOff({ error: 'test error' });
      const derived = new SupplyIsOff(base, { failed: false });

      expect(derived.failed).toBe(false);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBeUndefined();
    });
    it('overrides successful state explicitly', () => {

      const base = new SupplyIsOff({});
      const derived = new SupplyIsOff(base, { failed: true });

      expect(derived.failed).toBe(true);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBeUndefined();
    });
    it('overrides result', () => {

      const base = new SupplyIsOff<number>({ result: 1 });
      const derived = new SupplyIsOff(base, { result: 13 });

      expect(derived.failed).toBe(false);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBe(13);
    });
    it('overrides faulty state by result', () => {
      const base = new SupplyIsOff<number>({ error: 'test error' });
      const derived = new SupplyIsOff(base, { result: 13 });

      expect(derived.failed).toBe(false);
      expect(derived.error).toBeUndefined();
      expect(derived.result).toBe(13);
    });
    it('overrides failure error', () => {

      const base = new SupplyIsOff({ error: 'test error' });
      const derived = new SupplyIsOff(base, { error: 'other error' });

      expect(derived.failed).toBe(true);
      expect(derived.error).toBe('other error');
    });
    it('overrides successful state by error', () => {

      const base = new SupplyIsOff({});
      const derived = new SupplyIsOff(base, { error: 'test error' });

      expect(derived.failed).toBe(true);
      expect(derived.error).toBe('test error');
    });
  });

  describe('sameTimeAs', () => {
    it('returns `false` for independent indicators', () => {

      const isOff1 = new SupplyIsOff();
      const isOff2 = new SupplyIsOff();

      expect(isOff1.sameTimeAs(isOff2)).toBe(false);
      expect(isOff2.sameTimeAs(isOff1)).toBe(false);
    });
    it('returns `true` for the same indicator', () => {

      const isOff = new SupplyIsOff();

      expect(isOff.sameTimeAs(isOff)).toBe(true);
    });
    it('returns `true` for derived indicator', () => {

      const isOff1 = new SupplyIsOff();
      const isOff2 = new SupplyIsOff(isOff1, {});

      expect(isOff1.sameTimeAs(isOff2)).toBe(true);
      expect(isOff2.sameTimeAs(isOff1)).toBe(true);
    });
  });

  describe('toString', () => {
    it('indicates failure', () => {
      expect(String(new SupplyIsOff({ error: 'test error' })))
          .toMatch(/^SupplyIsOff\.Faultily#\d+\(error: test error\)$/);
    });
    it('indicates success', () => {
      expect(String(new SupplyIsOff({})))
          .toMatch(/^SupplyIsOff\.Successfully#\d+$/);
    });
  });
});
