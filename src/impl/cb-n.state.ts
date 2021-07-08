import type { Supply } from '../supply';
import { Supply$off$end, Supply$off$start } from './off';
import { SupplyState$off } from './off.state';
import { SupplyState, SupplyState__symbol } from './state';

export class SupplyState$CbN extends SupplyState {

  constructor(private readonly cb: ((this: void, reason?: unknown) => void)[]) {
    super();
  }

  off(supply: Supply, reason?: unknown): void {

    const prevOff = Supply$off$start();

    try {
      supply[SupplyState__symbol] = SupplyState$off(reason);
      for (const cb of this.cb) {
        cb(reason);
      }
    } finally {
      this.cb.length = 0;
      Supply$off$end(prevOff);
    }
  }

  whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    this.cb.push(callback);
  }

}
