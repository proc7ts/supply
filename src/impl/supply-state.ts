import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';

export interface SupplyState<out TResult> {

  readonly isOff: SupplyIsOff<TResult> | null;

  off(update: (supply: SupplyState<TResult>) => void, reason: SupplyIsOff<TResult>): void;

  alsoOff(update: (supply: SupplyState<TResult>) => void, receiver: SupplyReceiver<TResult>): void;

}
