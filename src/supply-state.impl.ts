import type { Supply } from './supply';

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

/**
 * @internal
 */
export const initialSupplyState: SupplyState = {
  isOff: false,
  off(supply: Supply, reason?: unknown): void {
    supply[SupplyState__symbol] = cutOffSupplyState(reason);
  },
  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = newSupplyState(callback);
  },
};

const doneSupplyState: SupplyState = {
  isOff: true,
  off: doneSupplyState$off,
  whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
    callback();
  },
};

function cutOffSupplyState(reason: unknown): SupplyState {
  if (reason === undefined) {
    return doneSupplyState;
  }

  return {
    isOff: true,
    off: doneSupplyState$off,
    whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
      callback(reason);
    },
  };
}

function doneSupplyState$off(_supply: Supply, _reason?: unknown): void {
  /* no off */
}

/**
 * @internal
 */
export function newSupplyState(off: (this: void, reason?: unknown) => void): SupplyState {
  return {
    isOff: false,
    off(supply: Supply, reason?: unknown): void {
      supply[SupplyState__symbol] = cutOffSupplyState(reason);
      off(reason);
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
