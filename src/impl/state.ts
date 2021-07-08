import type { Supply } from '../supply';

export const SupplyState__symbol = (/*#__PURE__*/ Symbol('SupplyState'));

export abstract class SupplyState {

  get isOff(): boolean {
    return false;
  }

  abstract off(supply: Supply, reason?: unknown): void;

  abstract whenOff(supply: Supply, callback: (reason?: unknown) => void): void;

}
