import { SupplyState$Cb1 } from './cb-1.state.js';
import { Supply$off$unexpected, SupplyState$On } from './on.state.js';
import type { SupplyState } from './state.js';

class SupplyState$Cb0 extends SupplyState$On {

  whenOff(update: (supply: SupplyState) => void, callback: (reason?: unknown) => void): void {
    update(new SupplyState$Cb1(callback));
  }

  protected override cb(reason: unknown): void {
    Supply$off$unexpected(reason);
  }

}

export const SupplyState$cb0 = (/*#__PURE__*/ new SupplyState$Cb0);
