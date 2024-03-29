import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';
import { SupplyState$Off } from './supply-state.off.js';
import { Supply$unexpectedFailure } from './unexpected-failure.js';

let Supply$off: 0 | 1 = 0;
let Supply$off$unexpected$reasons: Set<SupplyIsOff.Faultily> | undefined;

export abstract class SupplyState$On<out TResult> implements SupplyState<TResult> {

  get isOff(): null {
    return null;
  }

  off(update: (state: SupplyState<TResult>) => void, reason: SupplyIsOff<TResult>): void {
    update(new SupplyState$Off(reason));
    if (Supply$off) {
      this.#off(reason);
    } else {
      Supply$off = 1;
      try {
        this.#off(reason);
      } finally {
        Supply$off = 0;
        Supply$off$unexpected$report();
      }
    }
  }

  abstract alsoOff(
    update: (state: SupplyState<TResult>) => void,
    receiver: SupplyReceiver<TResult>,
  ): void;

  protected abstract _off(reason: SupplyIsOff<TResult>): boolean;

  #off(reason: SupplyIsOff<TResult>): void {
    if (!this._off(reason)) {
      Supply$off$unexpected(reason);
    }
  }

}

function Supply$off$unexpected(reason: SupplyIsOff<unknown>): void {
  if (reason.failed) {
    if (!Supply$off$unexpected$reasons) {
      Supply$off$unexpected$reasons = new Set();
    }
    Supply$off$unexpected$reasons.add(reason as SupplyIsOff.Faultily);
  }
}

function Supply$off$unexpected$report(): void {
  const reasons = Supply$off$unexpected$reasons;

  if (reasons) {
    Supply$off$unexpected$reasons = undefined;
    for (const reason of reasons) {
      Supply$unexpectedFailure(reason);
    }
  }
}
