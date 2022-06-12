import { describe, expect, it, jest } from '@jest/globals';
import { neverSupply } from './never-supply.js';
import { Supplier } from './supplier.js';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver } from './supply-receiver.js';
import { Supply } from './supply.js';

describe('neverSupply', () => {
  describe('isOff', () => {
    it('is always set', () => {
      expect(neverSupply().isOff).toEqual(expect.objectContaining({ failed: false }));
    });
  });

  describe('cutOff', () => {
    it('is no-op', () => {
      expect(neverSupply().cutOff(new SupplyIsOff())).toBe(neverSupply());
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
      const supply = neverSupply();

      expect(supply.whenOff(whenOff)).toBe(neverSupply());
      expect(whenOff).toHaveBeenCalledWith(neverSupply().isOff);

      supply.off('reason');
      expect(whenOff).toHaveBeenCalledTimes(1);

      supply.cutOff(new SupplyIsOff());
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
  });

  describe('alsoOff', () => {
    it('informs the receiver immediately', () => {

      const receiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const supply = neverSupply();

      expect(supply.alsoOff(receiver)).toBe(neverSupply());
      expect(receiver.cutOff).toHaveBeenCalledWith(neverSupply().isOff);

      supply.off('reason');
      expect(receiver.cutOff).toHaveBeenCalledTimes(1);

      supply.cutOff(new SupplyIsOff());
      expect(receiver.cutOff).toHaveBeenCalledTimes(1);
    });
    it('does not inform the unavailable receiver', () => {

      const receiver = {
        isOff: new SupplyIsOff(),
        cutOff: jest.fn(),
      };
      const supply = neverSupply();

      expect(supply.alsoOff(receiver)).toBe(neverSupply());

      supply.off('reason');
      expect(receiver.cutOff).not.toHaveBeenCalled();
    });
  });

  describe('as', () => {
    it('cuts off another supply immediately', () => {

      const supply = new Supply();
      const whenOff = jest.fn();

      supply.whenOff(whenOff);
      expect(neverSupply().as(supply)).toBe(neverSupply());
      expect(supply.isOff?.failed).toBe(false);
      expect(whenOff).toHaveBeenCalledWith(neverSupply().isOff);
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
    it('does not cut unavailable receiver', () => {

      const receiver: Supplier & SupplyReceiver = {
        isOff: new SupplyIsOff(),
        cutOff: jest.fn(),
        alsoOff: jest.fn(),
      };
      const supply = neverSupply();

      expect(supply.as(receiver)).toBe(neverSupply());
      supply.off('reason');
      expect(receiver.cutOff).not.toHaveBeenCalled();
      expect(receiver.alsoOff).not.toHaveBeenCalled();
    });
  });

  describe('needs', () => {
    it('does not cut off required supply', () => {

      const supply = new Supply();

      expect(neverSupply().needs(supply)).toBe(neverSupply());
      expect(supply.isOff).toBeNull();
    });
  });
});
