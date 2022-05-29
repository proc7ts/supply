import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';
import { SupplyState$off } from './supply-state.off.js';
import { Supply$unexpectedAbort } from './unexpected-abort.js';

let Supply$off: 0 | 1 = 0;
let Supply$off$unexpected$reasons: Set<unknown> | undefined;

export abstract class SupplyState$On implements SupplyState {

  get isOff(): boolean {
    return false;
  }

  get whyOff(): undefined {
    return;
  }

  off(update: (state: SupplyState) => void, reason?: unknown): void {
    update(SupplyState$off(reason));
    if (Supply$off) {
      this._off(reason);
    } else {
      Supply$off = 1;
      try {
        this._off(reason);
      } finally {
        Supply$off = 0;
        Supply$off$unexpected$report();
      }
    }
  }

  abstract offWith(update: (state: SupplyState) => void, receiver: SupplyReceiver): void;

  protected abstract _off(reason: unknown): void;

}

export function Supply$off$unexpected(reason: unknown): void {
  if (reason !== undefined) {
    if (!Supply$off$unexpected$reasons) {
      Supply$off$unexpected$reasons = new Set<unknown>();
    }
    Supply$off$unexpected$reasons.add(reason);
  }
}

function Supply$off$unexpected$report(): void {

  const reasons = Supply$off$unexpected$reasons;

  if (reasons) {
    Supply$off$unexpected$reasons = undefined;
    for (const reason of reasons) {
      Supply$unexpectedAbort(reason);
    }
  }
}
