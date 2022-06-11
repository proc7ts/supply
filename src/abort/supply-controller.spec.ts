import { describe, expect, it, jest } from '@jest/globals';
import { Supply } from '../supply.js';
import { SupplyAbortError } from './supply-abort.error.js';
import { SupplyController } from './supply-controller.js';

describe('SupplyController', () => {
  it('cuts off the supply on abort', () => {

    const ctl = new SupplyController();
    const { supply } = ctl;
    const whenOff = jest.fn();

    supply.whenOff(whenOff);

    expect(supply.isOff).toBeUndefined();

    const reason = new Error('Aborted');

    ctl.abort(reason);

    expect(supply.isOff?.error).toBe(reason);
    expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
  });
  it('aborts once supply cut off', () => {

    const whenOff = jest.fn();
    const supply = new Supply().whenOff(whenOff);
    const ctl = new SupplyController(supply);

    expect(ctl.supply).toBe(supply);

    const { signal } = ctl;
    const reason = new Error('Aborted');

    ctl.supply.off(reason);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe(reason);
    expect(whenOff).toHaveBeenCalledWith(expect.objectContaining({ error: reason }));
  });
  it('aborts with `SupplyAbortError` once supply cut off without explicit reason', () => {

    const ctl = new SupplyController(new Supply().whenOff(() => void 0));
    const { signal } = ctl;

    ctl.supply.off();
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toEqual(new SupplyAbortError());
  });
});
