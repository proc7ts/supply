import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock, SpyInstance } from 'jest-mock';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';
import { Supply, SupplyIn, SupplyOut } from './supply.js';

describe('Supply', () => {

  let whenOff: Mock<SupplyReceiverFn>;
  let supply: Supply;

  beforeEach(() => {
    whenOff = jest.fn();
    supply = new Supply(whenOff);
  });
  afterEach(() => {
    Supply.onUnexpectedFailure();
  });

  describe('split', () => {

    let supplyIn: SupplyIn;
    let supplyOut: SupplyOut;

    beforeEach(() => {
      [supplyIn, supplyOut] = Supply.split();
    });

    it('creates connected sides of supply', () => {

      const whenOff = jest.fn();

      supplyOut.whenOff(whenOff);
      supplyIn.off('test reason');

      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: 'test reason' }));
      expect(supplyIn.isOff?.error).toBe('test reason');
    });

    describe('supplyIn', () => {
      it('is itself', () => {
        expect(supplyIn.supplyIn).toBe(supplyIn);
      });
    });

    describe('supplyOut', () => {
      it('is itself', () => {
        expect(supplyOut.supplyOut).toBe(supplyOut);
      });
    });
  });

  describe('done', () => {

    let whenOff: Mock<SupplyReceiverFn<number>>;
    let supply: Supply<number>;

    beforeEach(() => {
      whenOff = jest.fn();
      supply = new Supply(whenOff);
    });

    it('informs initial supply receiver', () => {

      const result = 1;

      expect(supply.done(result)).toBe(supply);
      expect(supply.isOff?.result).toBe(result);
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ result }));
    });
    it('informs registered receiver', () => {

      const receiver: SupplyReceiverFn<number> = jest.fn();

      supply.whenOff(receiver);

      const result = 1;

      supply.done(result);

      expect(receiver).toHaveBeenCalledWith(expect.objectContaining({ result }));
    });
    it('informs receiver registered after completion', () => {

      const result = 1;

      supply.done(result);

      const receiver: SupplyReceiverFn<number> = jest.fn();

      supply.whenOff(receiver);

      expect(receiver).toHaveBeenCalledWith(expect.objectContaining({ result }));
    });
  });

  describe('off', () => {
    it('informs initial supply receiver', () => {

      const reason = 'some reason';

      expect(supply.off(reason)).toBe(supply);
      expect(supply.isOff?.error).toBe(reason);
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('(with callback) does not call unexpected failure handler', () => {

      const onFailure = jest.fn();

      Supply.onUnexpectedFailure(onFailure);
      supply.off('reason');

      expect(onFailure).not.toHaveBeenCalled();
    });
    it('(without callback) calls unexpected failure handler', () => {

      const onFailure = jest.fn();

      supply = new Supply();
      Supply.onUnexpectedFailure(onFailure);
      supply.off('reason');

      expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ error: 'reason' }));
      expect(onFailure).toHaveBeenCalledTimes(1);
    });
    it('(without callback and reason) does not call unexpected failure handler', () => {

      const onFailure = jest.fn();

      supply = new Supply();
      Supply.onUnexpectedFailure(onFailure);
      supply.off();

      expect(onFailure).not.toHaveBeenCalled();
    });
  });

  describe('isOff', () => {
    it('is undefined initially', () => {
      expect(supply.isOff).toBeNull();
    });
    it('is set when supply cut off without reason', () => {
      supply.off();

      expect(supply.isOff).toBeDefined();
      expect(supply.isOff?.failed).toBe(false);
      expect(supply.isOff?.error).toBeUndefined();
    });
    it('is set when supply cut off with custom reason', () => {
      supply.off('test reason');

      expect(supply.isOff).toBeDefined();
      expect(supply.isOff?.failed).toBe(true);
      expect(supply.isOff?.error).toBe('test reason');
    });
  });

  describe('supplyIn', () => {
    it('is not itself', () => {
      expect(supply.supplyIn).not.toBe(supply);
      expect(supply.supplyIn).not.toBeInstanceOf(Supply);
      expect(supply.supplyIn).toBeInstanceOf(SupplyIn);
    });
    it('depends on supply', () => {
      supply.off('test reason');

      expect(supply.supplyIn.isOff?.error).toBe('test reason');
    });
    it('required by supply', () => {
      supply.supplyIn.off('test reason');

      expect(supply.isOff?.error).toBe('test reason');
    });
  });

  describe('supplyOut', () => {
    it('is not itself', () => {
      expect(supply.supplyOut).not.toBe(supply);
      expect(supply.supplyOut).not.toBeInstanceOf(Supply);
      expect(supply.supplyOut).toBeInstanceOf(SupplyOut);
    });
    it('depends on supply', () => {

      const whenOff = jest.fn();

      supply.supplyOut.whenOff(whenOff);
      supply.off('test reason');

      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: 'test reason' }));
    });
  });

  describe('alsoOff', () => {
    it('returns `this` instance', () => {
      expect(supply.alsoOff(SupplyReceiver(() => void 0))).toBe(supply);
    });
    it('calls receiver', () => {

      const receiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver);
      supply.off(reason);

      expect(receiver.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('calls receiver without `isOff` implemented', () => {

      const receiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver);
      supply.off(reason);

      expect(receiver.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('calls the only receiver', () => {
      supply = new Supply();

      const receiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver);
      supply.off(reason);

      expect(receiver.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('does not call initially unavailable receiver', () => {

      const receiver = {
        isOff: new SupplyIsOff(),
        cutOff: jest.fn(),
      };

      supply.alsoOff(receiver);
      supply.off();

      expect(receiver.cutOff).not.toHaveBeenCalled();
    });
    it('does not call the receiver the became unavailable', () => {

      const receiver: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };

      supply.alsoOff(receiver);
      receiver.isOff = new SupplyIsOff();
      supply.off();

      expect(receiver.cutOff).not.toHaveBeenCalled();
    });
    it('does not call the only receiver if it became unavailable', () => {
      supply = new Supply();

      const receiver: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };

      supply.alsoOff(receiver);
      receiver.isOff = new SupplyIsOff();
      supply.off();

      expect(receiver.cutOff).not.toHaveBeenCalled();
    });
    it('does not call preceding receiver that became unavailable', () => {

      const receiver1: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const receiver2: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver1);
      supply.alsoOff(receiver2);
      receiver1.isOff = new SupplyIsOff();
      supply.off(reason);

      expect(receiver1.cutOff).not.toHaveBeenCalled();
      expect(receiver2.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('does not call the only receiver that became unavailable before another one added', () => {
      supply = new Supply();

      const receiver1: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const receiver2: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver1);
      receiver1.isOff = new SupplyIsOff();
      supply.alsoOff(receiver2);
      supply.off(reason);

      expect(receiver1.cutOff).not.toHaveBeenCalled();
      expect(receiver2.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('does not call all preceding receivers that became unavailable before another one added', () => {
      supply = new Supply();

      const receiver1: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const receiver2: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const receiver3: TestSupplyReceiver = {
        isOff: null,
        cutOff: jest.fn(),
      };
      const reason = 'reason';

      supply.alsoOff(receiver1);
      supply.alsoOff(receiver2);
      receiver1.isOff = new SupplyIsOff();
      receiver2.isOff = new SupplyIsOff();
      supply.alsoOff(receiver3);
      supply.off(reason);

      expect(receiver1.cutOff).not.toHaveBeenCalled();
      expect(receiver2.cutOff).not.toHaveBeenCalled();
      expect(receiver3.cutOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
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
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('calls registered callback only once', () => {

      const whenOff = jest.fn();
      const reason1 = 'reason1';
      const reason2 = 'reason2';

      supply.whenOff(whenOff);
      supply.off(reason1);
      supply.off(reason2);

      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason1 }));
      expect(whenOff).not.toHaveBeenCalledWith(expect.objectContaining({ error: reason2 }));
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
    it('calls registered callback when supply is cut off without reason', () => {

      const whenOff = jest.fn();

      supply.whenOff(whenOff);
      supply.off();

      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ failed: false }));
    });
    it('calls registered callback immediately if supply is cut off already', () => {

      const reason = 'reason';

      supply.off(reason);

      const mockCallback = jest.fn();

      supply.whenOff(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
  });

  describe('whenDone', () => {
    it('resolves when supply is cut off without reason', async () => {
      await expect(supply.off().whenDone()).resolves.toBeUndefined();
    });
    it('rejects when supply is cut off with reason', async () => {

      const reason = 'test';

      await expect(supply.off(reason).whenDone()).rejects.toBe(reason);
    });
    it('rejects when supply is cut off with `null` reason', async () => {
      await expect(supply.off(null).whenDone()).rejects.toBeNull();
    });
    it('resolves to supply result', async () => {

      const supply = new Supply<number>();

      await expect(supply.done(13).whenDone()).resolves.toBe(13);
    });
  });

  describe('needs', () => {
    it('is cut off when supplier cut off', () => {

      const whenOff = jest.fn();
      const supplier = new Supply();

      expect(supply.needs(supplier)).toBe(supply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      supplier.off(reason);
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
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
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('creates new required supply when omitted', () => {

      const whenOff = jest.fn();
      const requiredSupply = supply.require();

      expect(supply.require(requiredSupply)).toBe(requiredSupply);
      supply.whenOff(whenOff);

      const reason = 'some reason';

      requiredSupply.off(reason);
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
  });

  describe('derive', () => {
    it('cuts off another supply when cutting this one off', () => {

      const whenDerivedOff = jest.fn();
      const derivedSupply = new Supply(whenDerivedOff);

      expect(supply.derive(derivedSupply)).toBe(derivedSupply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenDerivedOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('creates new derived supply when omitted', () => {

      const whenDerivedOff = jest.fn();
      const derivedSupply = supply.derive().whenOff(whenDerivedOff);

      expect(derivedSupply).not.toBe(supply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenDerivedOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
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
      expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
    it('cuts off another supply when cutting this one off', () => {

      const whenAnotherOff = jest.fn();
      const anotherSupply = new Supply(whenAnotherOff);

      expect(supply.as(anotherSupply)).toBe(supply);

      const reason = 'some reason';

      supply.off(reason);
      expect(whenAnotherOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
    });
  });

  describe('onUnexpectedFailure', () => {

    let warnSpy: SpyInstance<(...args: unknown[]) => void>;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {/* noop */});
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('logs failure reason by default', () => {
      new Supply().off('reason');

      expect(warnSpy).toHaveBeenCalledWith('Supply aborted unexpectedly.', 'reason');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
    it('does not report unexpected failure when supply depends on itself', () => {

      const onFailure = jest.fn();

      Supply.onUnexpectedFailure(onFailure);

      const supply = new Supply();

      supply.alsoOff({
        get isOff() {
          return supply.isOff;
        },
        cutOff(reason) {
          supply.off(reason);
        },
      });

      supply.off('reason');
      expect(onFailure).not.toHaveBeenCalled();
    });
    it('replaces unexpected failure handler', () => {

      const onFailure = jest.fn();

      Supply.onUnexpectedFailure(onFailure);

      new Supply().off('reason');

      expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ error: 'reason' }));
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(warnSpy).not.toHaveBeenCalled();
    });
    it('reports failure reason only once', () => {

      const supply = new Supply().alsoOff(new Supply()).alsoOff(new Supply());
      const onFailure = jest.fn();

      Supply.onUnexpectedFailure(onFailure);
      supply.off('reason');

      expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ error: 'reason' }));
      expect(onFailure).toHaveBeenCalledTimes(1);
    });
  });
});

interface TestSupplyReceiver {
  isOff: SupplyReceiver['isOff'];
  cutOff: SupplyReceiver['cutOff'];
}
