import { describe, expect, it, jest } from '@jest/globals';
import { SupplyAbortError } from './supply-abort.error.js';
import { SupplyController } from './supply-controller.js';

describe('SupplyController', () => {
  it('cuts off the supply on abort', () => {
    const ctl = new SupplyController();
    const { supply } = ctl;
    const whenOff = jest.fn();

    supply.whenOff(whenOff);

    expect(supply.isOff).toBe(false);

    const reason = new Error('Aborted');

    ctl.abort(reason);

    expect(supply.isOff).toBe(true);
    expect(whenOff).toHaveBeenCalledWith(reason);
  });
  it('aborts once supply cut off', () => {
    const ctl = new SupplyController();
    const { signal } = ctl;
    const reason = new Error('Aborted');

    ctl.supply.off(reason);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe(reason);
  });
  it('aborts with `SupplyAbortError` once supply cut off without explicit reason', () => {
    const ctl = new SupplyController();
    const { signal } = ctl;

    ctl.supply.off();
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toEqual(new SupplyAbortError());
  });
});
