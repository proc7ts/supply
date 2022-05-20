import type { Supply } from '../supply.js';

export const SupplyState__symbol = (/* #__PUR E__ */ Symbol('SupplyState'));

export interface SupplyState {

  readonly isOff: boolean;

  off(supply: Supply, reason?: unknown): void;

  whenOff(supply: Supply, callback: (reason?: unknown) => void): void;

}
