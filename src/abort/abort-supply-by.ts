import { SupplyPeer } from '../supply-peer.js';
import { Supply } from '../supply.js';
import { SupplyAbortError } from './supply-abort.error.js';

/**
 * Aborts supply by given signal.
 *
 * Affects the supply provided by the target supply peer, if present. Creates new supply otherwise.
 *
 * If the given `signal` already aborted, then cuts off the supply with abort reason. Otherwise, cuts off the supply
 * once an abort `signal` received.
 *
 * @param signal - The signal that aborts the supply.
 * @param target - Target supply peer to abort.
 *
 * @returns Either existing `target` supply, or a new one.
 */
export function abortSupplyBy(signal: AbortSignal, target?: SupplyPeer): Supply {
  const supply = target?.supply ?? new Supply();

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

declare global {
  export interface AbortSignal {
    readonly reason?: unknown;
  }

  export interface AbortController {
    abort(reason?: unknown): void;
  }
}
