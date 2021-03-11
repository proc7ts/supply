import { alwaysSupply, isAlwaysSupply } from './always-supply';
import { neverSupply } from './never-supply';
import { Supply } from './supply';

describe('alwaysSupply', () => {
  describe('isOff', () => {
    it('is always `false`', () => {
      expect(alwaysSupply().isOff).toBe(false);
    });
  });

  describe('off', () => {
    it('is no-op', () => {

      const supply = alwaysSupply();

      expect(supply.off()).toBe(alwaysSupply());
      expect(supply.isOff).toBe(false);
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

  describe('cuts', () => {
    it('never cuts dependent supply', () => {

      const supply = alwaysSupply();
      const otherSupply = new Supply();
      const whenOff = jest.fn();

      otherSupply.whenOff(whenOff);
      expect(supply.cuts(otherSupply)).toBe(alwaysSupply());

      supply.off();
      expect(otherSupply.isOff).toBe(false);
      expect(whenOff).not.toHaveBeenCalled();
    });
  });

  describe('needs', () => {
    it('never cuts off the always-supply', () => {

      const supply = alwaysSupply();
      const otherSupply = new Supply();

      expect(supply.needs(otherSupply)).toBe(alwaysSupply());

      otherSupply.off('reason');
      expect(supply.isOff).toBe(false);
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
