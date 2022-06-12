import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';

export class SupplyState$Off implements SupplyState {

  constructor(readonly isOff: SupplyIsOff) {
  }

  off(_update: unknown, _reason?: unknown): void {
    // Already off.
  }

  alsoOff(_update: unknown, receiver: SupplyReceiver): void {
    receiver.cutOff(this.isOff);
  }

}
