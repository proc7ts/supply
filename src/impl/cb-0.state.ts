import type { Supply } from '../supply';
import { SupplyState$Cb1 } from './cb-1.state';
import { Supply$off$end, Supply$off$start, Supply$off$unexpected } from './off';
import { SupplyState$off } from './off.state';
import { SupplyState, SupplyState__symbol } from './state';

class SupplyState$Cb0 extends SupplyState {

  off(supply: Supply, reason?: unknown): void {

    const prevOff = Supply$off$start();

    try {
      supply[SupplyState__symbol] = SupplyState$off(reason);
      Supply$off$unexpected(reason);
    } finally {
      Supply$off$end(prevOff);
    }
  }

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = new SupplyState$Cb1(callback);
  }

}

export const SupplyState$cb0 = new SupplyState$Cb0;
