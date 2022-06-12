import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from '../supply-receiver.js';

export class FnSupplyReceiver implements SupplyReceiver {

  #off: SupplyReceiverFn | null;
  #isOff: SupplyIsOff | null = null;

  constructor(off: SupplyReceiverFn) {
    this.#off = off;
  }

  get isOff(): SupplyIsOff | null {
    return this.#isOff;
  }

  cutOff(reason: SupplyIsOff): void {
    this.#isOff = reason;

    const off = this.#off;

    this.#off = null;
    off?.(reason);
  }

}
