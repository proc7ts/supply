import { SupplyReceiver } from '../supply-receiver.js';
import { Supply } from '../supply.js';
import { SupplyAbortError } from './supply-abort.error.js';

export function abortSupplyBy(signal: AbortSignal, receiver?: undefined): Supply;
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver: TReceiver,
): TReceiver;
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver: TReceiver | undefined,
): TReceiver | Supply;

/**
 * Aborts supply by given signal.
 *
 * If the given `signal` already aborted, then cuts off the supply with abort reason. Otherwise, cuts off the supply
 * once an abort `signal` received.
 *
 * @typeParam TReceiver - Type of supply receiver to abort.
 * @param signal - The signal that aborts the supply.
 * @param receiver - Supply receiver to abort. New supply will be created when omitted.
 *
 * @returns Either existing `receiver` supply, or a new one.
 */
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver: TReceiver | Supply = new Supply(),
): SupplyReceiver | Supply {
  if (signal.aborted) {
    receiver.off(SupplyAbortError.reasonOf(signal));
  } else {

    const onAbort = (): void => {
      signal.removeEventListener('abort', onAbort);
      receiver.off(SupplyAbortError.reasonOf(signal));
    };

    signal.addEventListener('abort', onAbort);
  }

  return receiver;
}
