import type { Supply } from '../supply.js';
import { SupplyState$CbN } from './cb-n.state.js';
import { SupplyState$On } from './on.state.js';
import { SupplyState__symbol } from './state.js';

export class SupplyState$Cb1 extends SupplyState$On {

  constructor(protected readonly cb: (this: void, reason?: unknown) => void) {
    super();
  }

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void {
    supply[SupplyState__symbol] = new SupplyState$CbN([this.cb, callback]);
  }

}
