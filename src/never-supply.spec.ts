import { describe, expect, it, jest } from '@jest/globals';
import { neverSupply } from './never-supply.js';
import { Supplier } from './supplier.js';
import { SupplyReceiver } from './supply-receiver.js';
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
      expect(whenOff).toHaveBeenCalledWith();
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
  });

  describe('alsoOff', () => {
    it('informs the receiver immediately', () => {

      const receiver = { isOff: false, off: jest.fn() };
      const supply = neverSupply();

      expect(supply.alsoOff(receiver)).toBe(neverSupply());
      supply.off('reason');
      expect(receiver.off).toHaveBeenCalledWith();
    });
    it('does not inform the unavailable receiver', () => {

      const receiver = { isOff: true, off: jest.fn() };
      const supply = neverSupply();

      expect(supply.alsoOff(receiver)).toBe(neverSupply());
      supply.off('reason');
      expect(receiver.off).not.toHaveBeenCalled();
    });
  });

  describe('as', () => {
    it('cuts off another supply immediately', () => {

      const supply = new Supply();
      const whenOff = jest.fn();

      supply.whenOff(whenOff);
      expect(neverSupply().as(supply)).toBe(neverSupply());
      expect(supply.isOff).toBe(true);
      expect(whenOff).toHaveBeenCalledWith(undefined);
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
    it('does not cut the unavailable receiver', () => {

      const receiver: Supplier & SupplyReceiver = {
        isOff: true,
        off: jest.fn(),
        alsoOff: jest.fn(),
      };
      const supply = neverSupply();

      expect(supply.as(receiver)).toBe(neverSupply());
      supply.off('reason');
      expect(receiver.off).not.toHaveBeenCalled();
      expect(receiver.alsoOff).not.toHaveBeenCalled();
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
