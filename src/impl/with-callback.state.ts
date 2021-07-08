import type { Supply } from '../supply';
import { Supply$off$end, Supply$off$start } from './off';
import { SupplyState$off } from './off.state';
import type { SupplyState } from './state';
import { SupplyState__symbol } from './state';

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
