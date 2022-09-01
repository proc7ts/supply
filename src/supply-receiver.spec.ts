import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';
import { Supply } from './supply.js';

describe('SupplyReceiver', () => {
  describe('for object', () => {
    it('returns unconverted receiver', () => {
      const receiver = {
        isOff: null,
        cutOff: (_reason: SupplyIsOff) => void 0,
      };

      expect(SupplyReceiver(receiver)).toBe(receiver);
    });
  });

  describe('for function', () => {
    let supply: Supply;

    beforeEach(() => {
      supply = new Supply();
    });

    let whenOff: Mock<SupplyReceiverFn>;
    let receiver: SupplyReceiver;

    beforeEach(() => {
      whenOff = jest.fn();
      receiver = SupplyReceiver(whenOff);
      supply.alsoOff(receiver);
    });

    it('calls receiver function on cut off', () => {
      supply.off('reason');
      expect(whenOff).toHaveBeenCalledWith(
        expect.objectContaining({ failed: true, error: 'reason' }),
      );
    });
    it('makes receiver unavailable when cut off', () => {
      supply.off('reason');

      expect(receiver.isOff).toMatchObject({ failed: true, error: 'reason' });
    });
    it('calls receiver function at most once', () => {
      const reason = new SupplyIsOff({ error: 'test' });

      receiver.cutOff(reason);
      receiver.cutOff(reason);

      expect(whenOff).toHaveBeenCalledWith(reason);
      expect(whenOff).toHaveBeenCalledTimes(1);
    });
  });
});
