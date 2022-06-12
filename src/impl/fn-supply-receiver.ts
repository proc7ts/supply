import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from '../supply-receiver.js';

export class FnSupplyReceiver<in out TResult> implements SupplyReceiver<TResult> {

  #off: SupplyReceiverFn<TResult> | null;
  #isOff: SupplyIsOff<TResult> | null = null;

  constructor(off: SupplyReceiverFn<TResult>) {
    this.#off = off;
  }

  get isOff(): SupplyIsOff<TResult> | null {
    return this.#isOff;
  }

  cutOff(reason: SupplyIsOff<TResult>): void {
    this.#isOff = reason;

    const off = this.#off;

    this.#off = null;
    off?.(reason);
  }

}
