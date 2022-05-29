import { SupplyReceiver } from '../supply-receiver.js';

export interface SupplyState {

  readonly isOff: boolean;
  readonly whyOff: unknown | undefined;

  off(update: (supply: SupplyState) => void, reason?: unknown): void;

  alsoOff(update: (supply: SupplyState) => void, receiver: SupplyReceiver): void;

}
