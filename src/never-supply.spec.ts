import { describe, expect, it, jest } from '@jest/globals';
import { neverSupply } from './never-supply.js';
import { Supply } from './supply.js';

describe('neverSupply', () => {
  describe('isOff', () => {
    it('is always `true`', () => {
      expect(neverSupply().isOff).toBe(true);
    });
  });

  describe('off', () => {
    it('is no-op', () => {
      expect(neverSupply().off()).toBe(neverSupply());
    });
  });

  describe('whenOff', () => {
    it('calls back immediately', () => {

      const whenOff = jest.fn();

      expect(neverSupply().whenOff(whenOff)).toBe(neverSupply());
      expect(whenOff).toHaveBeenCalledWith(...([] as unknown[] as [unknown, ...unknown[]]));
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
  });

  describe('cuts', () => {
    it('cuts off dependent supply immediately', () => {

      const supply = new Supply();
      const whenOff = jest.fn();

      supply.whenOff(whenOff);
      expect(neverSupply().cuts(supply)).toBe(neverSupply());
      expect(supply.isOff).toBe(true);
      expect(whenOff).toHaveBeenCalledWith(undefined);
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
  });

  describe('needs', () => {
    it('does not cut off required supply', () => {

      const supply = new Supply();

      expect(neverSupply().needs(supply)).toBe(neverSupply());
      expect(supply.isOff).toBe(false);
    });
  });
});
