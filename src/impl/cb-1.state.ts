import type { Supply } from '../supply';
import { SupplyState$CbN } from './cb-n.state';
import { Supply$off$end, Supply$off$start } from './off';
import { SupplyState$off } from './off.state';
import { SupplyState, SupplyState__symbol } from './state';

export class SupplyState$Cb1 extends SupplyState {

  constructor(private readonly cb: (this: void, reason?: unknown) => void) {
    super();
  }

  off(supply: Supply, reason?: unknown): void {

    const prevOff = Supply$off$start();

    try {
      supply[SupplyState__symbol] = SupplyState$off(reason);
      this.cb(reason);
    } finally {
      Supply$off$end(prevOff);
    }
  }

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = new SupplyState$CbN([this.cb, callback]);
  }

}
