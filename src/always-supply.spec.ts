import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { alwaysSupply, isAlwaysSupply } from './always-supply.js';
import { neverSupply } from './never-supply.js';
import { Supply } from './supply.js';

describe('alwaysSupply', () => {
  afterEach(() => {
    Supply.onUnexpectedFailure();
  });

  describe('isOff', () => {
    it('is always undefined', () => {
      expect(alwaysSupply().isOff).toBeUndefined();
    });
  });

  describe('off', () => {
    it('is no-op', () => {

      const supply = alwaysSupply();

      expect(supply.off()).toBe(alwaysSupply());
      expect(supply.isOff).toBeUndefined();
    });
  });

  describe('whenOff', () => {
    it('does nothing', () => {

      const whenOff = jest.fn();
      const supply = alwaysSupply();

      expect(supply.whenOff(whenOff)).toBe(alwaysSupply());
      supply.off('reason');
      expect(whenOff).not.toHaveBeenCalled();
    });
  });

  describe('alsoOff', () => {
    it('does nothing', () => {

      const receiver = { off: jest.fn() };
      const supply = alwaysSupply();

      expect(supply.alsoOff(receiver)).toBe(alwaysSupply());
      supply.off('reason');
      expect(receiver.off).not.toHaveBeenCalled();
    });
    it('never cuts dependent supply', () => {

      const supply = alwaysSupply();
      const receiver = new Supply();
      const whenOff = jest.fn();

      receiver.whenOff(whenOff);
      expect(supply.alsoOff(receiver)).toBe(alwaysSupply());

      supply.off();
      expect(receiver.isOff).toBeUndefined();
      expect(whenOff).not.toHaveBeenCalled();
    });
  });

  describe('needs', () => {
    it('never cuts off the always-supply', () => {

      const onAbort = jest.fn();

      Supply.onUnexpectedFailure(onAbort);

      const supply = alwaysSupply();
      const otherSupply = new Supply();

      expect(supply.needs(otherSupply)).toBe(alwaysSupply());

      otherSupply.off('reason');
      expect(supply.isOff).toBeUndefined();
      expect(onAbort).toHaveBeenCalledWith(expect.objectContaining({ error: 'reason' }));
      expect(onAbort).toHaveBeenCalledTimes(1);
    });
  });

  describe('as', () => {
    it('never cuts dependent supply', () => {

      const supply = alwaysSupply();
      const otherSupply = new Supply();
      const whenOff = jest.fn();

      otherSupply.whenOff(whenOff);
      expect(supply.as(otherSupply)).toBe(alwaysSupply());

      supply.off();
      expect(otherSupply.isOff).toBeUndefined();
      expect(whenOff).not.toHaveBeenCalled();
    });
    it('never cuts off the always-supply', () => {

      const onAbort = jest.fn();

      Supply.onUnexpectedFailure(onAbort);

      const supply = alwaysSupply();
      const otherSupply = new Supply();

      expect(supply.as(otherSupply)).toBe(alwaysSupply());

      otherSupply.off('reason');
      expect(supply.isOff).toBeUndefined();
      expect(onAbort).toHaveBeenCalledWith(expect.objectContaining({ error: 'reason' }));
      expect(onAbort).toHaveBeenCalledTimes(1);
    });
  });
});

describe('isAlwaysSupply', () => {
  it('returns `true` for `alwaysSupply()` result', () => {
    expect(isAlwaysSupply(alwaysSupply())).toBe(true);
  });
  it('returns `false` for `neverSupply()` result', () => {
    expect(isAlwaysSupply(neverSupply())).toBe(false);
  });
  it('returns `false` for arbitrary supply', () => {
    expect(isAlwaysSupply(new Supply())).toBe(false);
  });
});
