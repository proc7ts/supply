import type { Supply } from '../supply';
import { Supply$off$end, Supply$off$start, Supply$off$unexpected } from './off';

/**
 * @internal
 */
export const SupplyState__symbol = (/*#__PURE__*/ Symbol('SupplyState'));

/**
 * @internal
 */
export interface SupplyState {

  readonly isOff: boolean;

  off(supply: Supply, reason?: unknown): void;

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void;

}

const SupplyState$done: SupplyState = {
  isOff: true,
  off: SupplyState$done$off,
  whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
    callback();
  },
};

function SupplyState$off(reason: unknown): SupplyState {
  if (reason === undefined) {
    return SupplyState$done;
  }

  return {
    isOff: true,
    off: SupplyState$done$off,
    whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
      callback(reason);
    },
  };
}

function SupplyState$done$off(_supply: Supply, _reason?: unknown): void {
  /* no off */
}

/**
 * @internal
 */
export const SupplyState$noCallback: SupplyState = {
  isOff: false,
  off(supply: Supply, reason?: unknown): void {

    const prevOff = Supply$off$start();

    try {
      supply[SupplyState__symbol] = SupplyState$off(reason);
      Supply$off$unexpected(reason);
    } finally {
      Supply$off$end(prevOff);
    }
  },
  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = SupplyState$withCallback(callback);
  },
};

/**
 * @internal
 */
export function SupplyState$withCallback(off: (this: void, reason?: unknown) => void): SupplyState {
  return {
    isOff: false,
    off(supply: Supply, reason?: unknown): void {

      const prevOff = Supply$off$start();

      try {
        supply[SupplyState__symbol] = SupplyState$off(reason);
        off(reason);
      } finally {
        Supply$off$end(prevOff);
      }
    },
    whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {

      const prev = off;

      off = reason => {
        prev(reason);
        callback(reason);
      };
    },
  };
}
