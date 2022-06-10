import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Supply } from '../supply.js';
import { abortSupplyBy } from './abort-supply-by.js';
import { SupplyAbortError } from './supply-abort.error.js';

describe('abortSupplyBy', () => {

  let abortCtl: AbortController;
  let signal: AbortSignal;

  beforeEach(() => {
    abortCtl = new AbortController();
    signal = abortCtl.signal;
  });

  it('cuts off supply immediately by aborted signal', () => {

    const reason = new Error('Aborted');

    abortCtl.abort(reason);

    const whenOff = jest.fn();

    abortSupplyBy(signal, { off: whenOff });

    expect(whenOff).toHaveBeenCalledWith(reason);
  });
  it('cuts off supply immediately by signal aborted without explicit reason', () => {
    abortCtl.abort();

    const whenOff = jest.fn();

    abortSupplyBy(signal, { off: whenOff });

    expect(whenOff).toHaveBeenCalledWith(new SupplyAbortError());
  });
  it('cuts off supply when abort signal received', () => {

    const supply = new Supply().needs(abortSupplyBy(signal));
    const whenOff = jest.fn();

    supply.whenOff(whenOff);
    expect(supply.isOff).toBe(false);

    const reason = new Error('Aborted');

    abortCtl.abort(reason);
    expect(supply.isOff).toBe(true);
    expect(whenOff).toHaveBeenCalledWith(reason);
  });
  it('cuts off supply when abort signal without explicit reason received', () => {

    const supply = new Supply().needs(abortSupplyBy(signal));
    const whenOff = jest.fn();

    supply.whenOff(whenOff);
    expect(supply.isOff).toBe(false);

    abortCtl.abort();
    expect(supply.isOff).toBe(true);
    expect(whenOff).toHaveBeenCalledWith(new SupplyAbortError());
  });
});
