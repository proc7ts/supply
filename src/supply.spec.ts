import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock, SpyInstance } from 'jest-mock';
import { Supply } from './supply.js';

describe('Supply', () => {

  let whenOff: Mock<(reason?: unknown) => void>;
  let supply: Supply;

  beforeEach(() => {
    whenOff = jest.fn();
    supply = new Supply(whenOff);
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
      expect(whenOff).toHaveBeenCalledWith(reason);
      expect(supply.whyOff).toBe(reason);
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
    it('is `false` initially', () => {
      expect(supply.isOff).toBe(false);
    });
    it('is `true` when supply cut off', () => {
      supply.off();

      expect(supply.isOff).toBe(true);
    });
  });

  describe('whyOff', () => {
    it('is `undefined` initially', () => {
      expect(supply.whyOff).toBeUndefined();
    });
    it('is `undefined` when supply cut off without reason', () => {
      supply.off();
      expect(supply.whyOff).toBeUndefined();
    });
    it('is set to reason when supply cut off', () => {

      const reason = 'reason';

      supply.off(reason);

      expect(supply.whyOff).toBe(reason);
    });
  });

  describe('to', () => {
    it('returns `this` instance', () => {
      expect(supply.to({ isOff: false, off: () => {/* noop */} })).toBe(supply);
    });
    it('calls receiver', () => {

      const receiver = {
        isOff: false,
        off: jest.fn(),
      };
      const reason = 'reason';

      supply.to(receiver);
      supply.off(reason);

      expect(receiver.off).toHaveBeenCalledWith(reason);
    });
    it('calls the only receiver', () => {
      supply = new Supply();

      const receiver = {
        isOff: false,
        off: jest.fn(),
      };
      const reason = 'reason';

      supply.to(receiver);
      supply.off(reason);

      expect(receiver.off).toHaveBeenCalledWith(reason);
    });
    it('does not call initially unavailable receiver', () => {

      const receiver = {
        isOff: true,
        off: jest.fn(),
      };

      supply.to(receiver);
      supply.off();

      expect(receiver.off).not.toHaveBeenCalled();
    });
    it('does not call the receiver the became unavailable', () => {
      const receiver = {
        isOff: false,
        off: jest.fn(),
      };

      supply.to(receiver);
      receiver.isOff = true;
      supply.off();

      expect(receiver.off).not.toHaveBeenCalled();
    });
    it('does not call the only receiver if it became unavailable', () => {
      supply = new Supply();

      const receiver = {
        isOff: false,
        off: jest.fn(),
      };

      supply.to(receiver);
      receiver.isOff = true;
      supply.off();

      expect(receiver.off).not.toHaveBeenCalled();
    });
    it('does not call preceding receiver that became unavailable', () => {

      const receiver1 = {
        isOff: false,
        off: jest.fn(),
      };
      const receiver2 = {
        isOff: false,
        off: jest.fn(),
      };
      const reason = 'reason';

      supply.to(receiver1);
      supply.to(receiver2);
      receiver1.isOff = true;
      supply.off(reason);

      expect(receiver1.off).not.toHaveBeenCalled();
      expect(receiver2.off).toHaveBeenCalledWith(reason);
    });
    it('does not call the only receiver that became unavailable before another one added', () => {
      supply = new Supply();

      const receiver1 = {
        isOff: false,
        off: jest.fn(),
      };
      const receiver2 = {
        isOff: false,
        off: jest.fn(),
      };
      const reason = 'reason';

      supply.to(receiver1);
      receiver1.isOff = true;
      supply.to(receiver2);
      supply.off(reason);

      expect(receiver1.off).not.toHaveBeenCalled();
      expect(receiver2.off).toHaveBeenCalledWith(reason);
    });
    it('does not call all preceding receivers that became unavailable before another one added', () => {
      supply = new Supply();

      const receiver1 = {
        isOff: false,
        off: jest.fn(),
      };
      const receiver2 = {
        isOff: false,
        off: jest.fn(),
      };
      const receiver3 = {
        isOff: false,
        off: jest.fn(),
      };
      const reason = 'reason';

      supply.to(receiver1);
      supply.to(receiver2);
      receiver1.isOff = true;
      receiver2.isOff = true;
      supply.to(receiver3);
      supply.off(reason);

      expect(receiver1.off).not.toHaveBeenCalled();
      expect(receiver2.off).not.toHaveBeenCalled();
      expect(receiver3.off).toHaveBeenCalledWith(reason);
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

    let errorSpy: SpyInstance<(...args: unknown[]) => void>;

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
