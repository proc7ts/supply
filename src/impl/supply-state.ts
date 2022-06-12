import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';

export interface SupplyState {

  readonly isOff: SupplyIsOff | null;

  off(update: (supply: SupplyState) => void, reason: SupplyIsOff): void;

  alsoOff(update: (supply: SupplyState) => void, receiver: SupplyReceiver): void;

}
