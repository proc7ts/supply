import type { Supply } from '../supply.js';
import { SupplyState$off } from './off.state.js';
import type { SupplyState } from './state.js';
import { SupplyState__symbol } from './state.js';
import { Supply$unexpectedAbort } from './unexpected-abort.js';

let Supply$off: 0 | 1 = 0;
let Supply$off$unexpected$reasons: Set<unknown> | undefined;

export abstract class SupplyState$On implements SupplyState {

  get isOff(): boolean {
    return false;
  }

  off(supply: Supply, reason?: unknown): void {
    supply[SupplyState__symbol] = SupplyState$off(reason);
    if (Supply$off) {
      this.cb(reason);
    } else {
      Supply$off = 1;
      try {
        this.cb(reason);
      } finally {
        Supply$off = 0;
        Supply$off$unexpected$report();
      }
    }
  }

  abstract whenOff(supply: Supply, callback: (reason?: unknown) => void): void;

  protected abstract cb(reason: unknown): void;

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
