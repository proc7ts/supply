import type { Supply } from '../supply';
import { SupplyState$cbN } from './cb-n.state';
import { Supply$off$end, Supply$off$start } from './off';
import { SupplyState$off } from './off.state';
import type { SupplyState } from './state';
import { SupplyState__symbol } from './state';

export function SupplyState$cb1(off: (this: void, reason?: unknown) => void): SupplyState {
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
    whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
      supply[SupplyState__symbol] = SupplyState$cbN([off, callback]);
    },
  };
}
