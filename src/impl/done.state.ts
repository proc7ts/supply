import type { Supply } from '../supply';
import type { SupplyState } from './state';

export class SupplyState$Done implements SupplyState {

  get isOff(): true {
    return true;
  }

  off(_supply: Supply, _reason?: unknown): void {
    // Already off.
  }

  whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    callback();
  }

}

export const SupplyState$done = new SupplyState$Done;
