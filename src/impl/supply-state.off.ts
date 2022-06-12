import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';

export class SupplyState$Off<out TResult> implements SupplyState<TResult> {

  constructor(readonly isOff: SupplyIsOff<TResult>) {
  }

  off(_update: (supply: SupplyState<TResult>) => void, _reason?: SupplyIsOff<TResult>): void {
    // Already off.
  }

  alsoOff(_update: (supply: SupplyState<TResult>) => void, receiver: SupplyReceiver<TResult>): void {
    receiver.cutOff(this.isOff);
  }

}
