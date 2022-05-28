import { SupplyReceiver } from '../supply-receiver.js';

export interface SupplyState {

  readonly isOff: boolean;
  readonly reason: unknown | undefined;

  off(update: (supply: SupplyState) => void, reason?: unknown): void;

  to(update: (supply: SupplyState) => void, receiver: SupplyReceiver): void;

}
