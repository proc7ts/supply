import { neverSupply } from './never-supply';
import { Supply } from './supply';

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
