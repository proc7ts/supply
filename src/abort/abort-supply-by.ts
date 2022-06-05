import { Supply, SupplyOut } from '../supply.js';
import { SupplyAbortError } from './supply-abort.error.js';

/**
 * Aborts supply by given signal.
 *
 * If the given `signal` already aborted, then cuts off the supply with abort reason. Otherwise, cuts off the supply
 * once an abort `signal` received.
 *
 * @param signal - The signal that aborts the supply.
 *
 * @returns New supplier instance cut off once the `signal` aborted.
 */
export function abortSupplyBy(signal: AbortSignal): SupplyOut {

  const [supplyIn, supplyOut] = Supply.split();

  if (signal.aborted) {
    supplyIn.off(SupplyAbortError.reasonOf(signal));
  } else {

    const onAbort = (): void => {
      signal.removeEventListener('abort', onAbort);
      supplyIn.off(SupplyAbortError.reasonOf(signal));
    };

    signal.addEventListener('abort', onAbort);
  }

  return supplyOut;
}
