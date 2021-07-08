import type { Supply } from '../supply';

export const SupplyState__symbol = (/*#__PURE__*/ Symbol('SupplyState'));

export interface SupplyState {

  readonly isOff: boolean;

  off(supply: Supply, reason?: unknown): void;

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void;

}
