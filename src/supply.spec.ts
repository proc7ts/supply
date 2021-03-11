import { asis, noop } from '@proc7ts/primitives';
import { Supply } from './supply';

describe('Supply', () => {

  let mockOff: jest.Mock<void, [reason?: unknown]>;
  let supply: Supply;

  beforeEach(() => {
    mockOff = jest.fn();
    supply = new Supply(mockOff);
  });

  describe('supply', () => {
    it('returns the supply itself', () => {
      expect(supply.supply).toBe(supply);
    });
  });

  describe('off', () => {
    it('calls `off` function', () => {

      const reason = 'some reason';

      expect(supply.off(reason)).toBe(supply);
      expect(mockOff).toHaveBeenCalledWith(reason);
    });
  });

  describe('isOff', () => {
    it('is set to `false` initially', () => {
      expect(supply.isOff).toBe(false);
    });
    it('is set to `true` when supply is cut off', () => {
      supply.off();
      expect(supply.isOff).toBe(true);
    });
  });

  describe('whenOff', () => {
    it('returns `this` instance', () => {
      expect(supply.whenOff(noop)).toBe(supply);
    });
    it('calls registered callback', () => {

      const whenOff = jest.fn();
      const reason = 'reason';

      supply.whenOff(whenOff);
      supply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
    it('calls registered callback only once', () => {

      const whenOff = jest.fn();
      const reason1 = 'reason1';
      const reason2 = 'reason2';

      supply.whenOff(whenOff);
      supply.off(reason1);
      supply.off(reason2);
      expect(whenOff).toHaveBeenCalledWith(reason1);
      expect(whenOff).not.toHaveBeenCalledWith(reason2);
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
    it('calls registered callback when supply is cut off without reason', () => {

      const whenOff = jest.fn();

      supply.whenOff(whenOff);
      supply.off();
      expect(whenOff).toHaveBeenCalledWith(undefined);
    });
    it('calls registered callback immediately if supply is cut off already', () => {

      const reason = 'reason';

      supply.off(reason);

      const mockCallback = jest.fn();

      supply.whenOff(mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(reason);
    });
  });

  describe('whenDone', () => {
    it('resolves when supply is cut off without reason', async () => {
      expect(await supply.off().whenDone()).toBeUndefined();
    });
    it('rejects when supply is cut off with reason', async () => {

      const reason = 'test';

      expect(await supply.off(reason).whenDone().then(() => 'resolved', asis)).toBe(reason);
    });
    it('rejects when supply is cut off with `null` reason', async () => {
      expect(await supply.off(null).whenDone().then(() => 'resolved', asis)).toBeNull();
    });
  });

  describe('needs', () => {
    it('is cut off when required supply is cut off', () => {

      const whenOff = jest.fn();
      const anotherSupply = new Supply();

      expect(supply.needs(anotherSupply)).toBe(supply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      anotherSupply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
  });

  describe('cuts', () => {
    it('cuts off another supply when cutting this one off', () => {

      const whenAnotherOff = jest.fn();
      const anotherSupply = new Supply(whenAnotherOff);

      expect(supply.cuts(anotherSupply)).toBe(supply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenAnotherOff).toHaveBeenCalledWith(reason);
    });
    it('cuts off another supply if this one is cut off already', () => {

      const reason = 'some reason';

      supply.off(reason);

      const whenAnotherOff = jest.fn();
      const anotherSupply = new Supply(whenAnotherOff);

      expect(supply.cuts(anotherSupply)).toBe(supply);
      expect(whenAnotherOff).toHaveBeenCalledWith(reason);
    });
  });

  describe('as', () => {
    it('is cut off when required supply is cut off', () => {

      const whenOff = jest.fn();
      const anotherSupply = new Supply();

      expect(supply.as(anotherSupply)).toBe(supply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      anotherSupply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
    it('cuts off another supply when cutting this one off', () => {

      const whenAnotherOff = jest.fn();
      const anotherSupply = new Supply(whenAnotherOff);

      expect(supply.as(anotherSupply)).toBe(supply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenAnotherOff).toHaveBeenCalledWith(reason);
    });
  });
});
