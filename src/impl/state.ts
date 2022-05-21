export interface SupplyState {

  readonly isOff: boolean;
  readonly reason: unknown | undefined;

  off(update: (supply: SupplyState) => void, reason?: unknown): void;

  whenOff(update: (supply: SupplyState) => void, callback: (reason?: unknown) => void): void;

}
