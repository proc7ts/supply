import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock, SpyInstance } from 'jest-mock';
import { Supply } from './supply';

describe('Supply', () => {

  let mockOff: Mock<void, [reason?: unknown]>;
  let supply: Supply;

  beforeEach(() => {
    mockOff = jest.fn();
    supply = new Supply(mockOff);
  });
  afterEach(() => {
    Supply.onUnexpectedAbort();
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
    it('(with callback) does not call unexpected abort handler', () => {

      const onAbort = jest.fn();

      Supply.onUnexpectedAbort(onAbort);
      supply.off('reason');

      expect(onAbort).not.toHaveBeenCalled();
    });
    it('(without callback) calls unexpected abort handler', () => {

      const onAbort = jest.fn();

      supply = new Supply();
      Supply.onUnexpectedAbort(onAbort);
      supply.off('reason');

      expect(onAbort).toHaveBeenCalledWith('reason');
      expect(onAbort).toHaveBeenCalledTimes(1);
    });
    it('(without callback and reason) does not call unexpected abort handler', () => {

      const onAbort = jest.fn();

      supply = new Supply();
      Supply.onUnexpectedAbort(onAbort);
      supply.off();

      expect(onAbort).not.toHaveBeenCalled();
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
      expect(supply.whenOff(() => {/* noop */})).toBe(supply);
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

      expect(await supply.off(reason).whenDone().then(() => 'resolved', e => e)).toBe(reason);
    });
    it('rejects when supply is cut off with `null` reason', async () => {
      expect(await supply.off(null).whenDone().then(() => 'resolved', e => e)).toBeNull();
    });
  });

  describe('needs', () => {
    it('is cut off when required supply cut off', () => {

      const whenOff = jest.fn();
      const anotherSupply = new Supply();

      expect(supply.needs(anotherSupply)).toBe(supply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      anotherSupply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
  });

  describe('require', () => {
    it('cuts off original supply when required one cut off', () => {

      const whenOff = jest.fn();
      const requiredSupply = new Supply();

      expect(supply.require(requiredSupply)).toBe(requiredSupply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      requiredSupply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
    it('creates new required supply when omitted', () => {

      const whenOff = jest.fn();
      const requiredSupply = supply.require();

      expect(supply.require(requiredSupply)).toBe(requiredSupply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      requiredSupply.off(reason);
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

  describe('derive', () => {
    it('cuts off another supply when cutting this one off', () => {

      const whenDerivedOff = jest.fn();
      const derivedSupply = new Supply(whenDerivedOff);

      expect(supply.derive(derivedSupply)).toBe(derivedSupply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenDerivedOff).toHaveBeenCalledWith(reason);
    });
    it('creates new derived supply when omitted', () => {

      const whenDerivedOff = jest.fn();
      const derivedSupply = supply.derive().whenOff(whenDerivedOff);

      expect(derivedSupply).not.toBe(supply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenDerivedOff).toHaveBeenCalledWith(reason);
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

  describe('onUnexpectedAbort', () => {

    let errorSpy: SpyInstance<void, any[]>;

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {/* noop */});
    });
    afterEach(() => {
      errorSpy.mockRestore();
    });

    it('logs abort reason by default', () => {
      new Supply().off('reason');

      expect(errorSpy).toHaveBeenCalledWith('Supply aborted unexpectedly.', 'reason');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
    it('replaces unexpected abort handler', () => {

      const onAbort = jest.fn();

      Supply.onUnexpectedAbort(onAbort);

      new Supply().off('reason');

      expect(onAbort).toHaveBeenCalledWith('reason');
      expect(onAbort).toHaveBeenCalledTimes(1);
      expect(errorSpy).not.toHaveBeenCalled();
    });
    it('reports abort reason only once', () => {

      const supply = new Supply().cuts(new Supply()).cuts(new Supply());
      const onAbort = jest.fn();

      Supply.onUnexpectedAbort(onAbort);
      supply.off('reason');

      expect(onAbort).toHaveBeenCalledWith('reason');
      expect(onAbort).toHaveBeenCalledTimes(1);
    });
  });
});
