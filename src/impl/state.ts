export interface SupplyState {

  readonly isOff: boolean;

  off(update: (supply: SupplyState) => void, reason?: unknown): void;

  whenOff(update: (supply: SupplyState) => void, callback: (reason?: unknown) => void): void;

}
