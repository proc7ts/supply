import type { Supply } from '../supply.js';
import { SupplyState$Cb1 } from './cb-1.state.js';
import { Supply$off$unexpected, SupplyState$On } from './on.state.js';
import { SupplyState__symbol } from './state.js';

class SupplyState$Cb0 extends SupplyState$On {

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = new SupplyState$Cb1(callback);
  }

  protected override cb(reason: unknown): void {
    Supply$off$unexpected(reason);
  }

}

export const SupplyState$cb0 = (/*#__PURE__*/ new SupplyState$Cb0);
