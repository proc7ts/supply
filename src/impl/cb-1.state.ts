import { SupplyState$CbN } from './cb-n.state.js';
import { SupplyState$On } from './on.state.js';
import { SupplyState } from './state.js';

export class SupplyState$Cb1 extends SupplyState$On {

  readonly #cb: (this: void, reason?: unknown) => void;

  constructor(cb: (this: void, reason?: unknown) => void) {
    super();
    this.#cb = cb;
  }

  whenOff(update: (supply: SupplyState) => void, callback: (reason?: unknown) => void): void {
    update(new SupplyState$CbN([this.#cb, callback]));
  }

  protected override cb(reason: unknown): void {
    this.#cb(reason);
  }

}
