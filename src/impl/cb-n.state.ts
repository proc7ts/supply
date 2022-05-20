import { SupplyState$On } from './on.state.js';

export class SupplyState$CbN extends SupplyState$On {

  readonly #cbs: ((this: void, reason?: unknown) => void)[];

  constructor(cbs: ((this: void, reason?: unknown) => void)[]) {
    super();
    this.#cbs = cbs;
  }

  whenOff(_update: unknown, callback: (reason?: unknown) => void): void {
    this.#cbs.push(callback);
  }

  protected override cb(reason: unknown): void {
    for (const cb of this.#cbs) {
      cb(reason);
    }
  }

}
