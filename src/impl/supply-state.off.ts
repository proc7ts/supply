import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';

class SupplyState$Off implements SupplyState {

  constructor(readonly reason: unknown) {
  }

  get isOff(): true {
    return true;
  }

  off(_update: unknown, _reason?: unknown): void {
    // Already off.
  }

  to(_update: unknown, receiver: SupplyReceiver): void {
    receiver.off(this.reason);
  }

}

const SupplyState$done = (/*#__PURE__*/ new SupplyState$Off(void 0));

export function SupplyState$off(reason: unknown): SupplyState {
  return reason === undefined ? SupplyState$done : new SupplyState$Off(reason);
}
