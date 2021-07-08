import type { Supply } from '../supply';
import { SupplyState$cb1 } from './cb-1.state';
import { Supply$off$end, Supply$off$start, Supply$off$unexpected } from './off';
import { SupplyState$off } from './off.state';
import type { SupplyState } from './state';
import { SupplyState__symbol } from './state';

export const SupplyState$cb0: SupplyState = {
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
    supply[SupplyState__symbol] = SupplyState$cb1(callback);
  },
};
