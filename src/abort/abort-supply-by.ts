import { SupplyPeer } from '../supply-peer.js';
import { SupplyReceiver } from '../supply-receiver.js';
import { Supply } from '../supply.js';
import { SupplyAbortError } from './supply-abort.error.js';

export function abortSupplyBy(signal: AbortSignal, receiver?: undefined): Supply;
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver: SupplyPeer<TReceiver>,
): TReceiver;
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver?: SupplyPeer<TReceiver>,
): TReceiver | Supply;

/**
 * Aborts supply by given signal.
 *
 * Affects the supply provided by the receiving supply peer, if present. Creates new supply otherwise.
 *
 * If the given `signal` already aborted, then cuts off the supply with abort reason. Otherwise, cuts off the supply
 * once an abort `signal` received.
 *
 * @param signal - The signal that aborts the supply.
 * @param receiver - Receiving supply peer to abort.
 *
 * @returns Either existing `receiver` supply, or a new one.
 */
export function abortSupplyBy<TReceiver extends SupplyReceiver>(
    signal: AbortSignal,
    receiver: SupplyPeer<TReceiver> | Supply = new Supply(),
): SupplyReceiver | Supply {

  const supply = receiver.supply;

  if (signal.aborted) {
    supply.off(SupplyAbortError.reasonOf(signal));
  } else {

    const onAbort = (): void => {
      signal.removeEventListener('abort', onAbort);
      supply.off(SupplyAbortError.reasonOf(signal));
    };

    signal.addEventListener('abort', onAbort);
  }

  return supply;
}
