import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { timedSupply } from './timed-supply.js';

describe('timedSupply', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('cuts off the supply after timeout', () => {

    const supply = timedSupply(10_000);

    jest.advanceTimersByTime(10_000);

    expect(supply.isOff?.error).toEqual(new Error('Timed out after 10000 ms'));
  });
  it('cuts off the supply with custom reason after timeout', () => {

    const supply = timedSupply(10_000, { createReason: timeout => `Test timeout: ${timeout}` });

    jest.advanceTimersByTime(10_000);

    expect(supply.isOff?.error).toBe('Test timeout: 10000');
  });
  it('can be cut off before the timeout', () => {

    const supply = timedSupply(10_000);

    jest.advanceTimersByTime(9_999);
    supply.off('test reason');
    jest.advanceTimersByTime(1000);

    expect(supply.isOff?.error).toBe('test reason');
  });
});
