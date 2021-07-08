import type { Supply } from '../supply';
import type { SupplyState } from './state';

class SupplyState$Off implements SupplyState {

  constructor(private readonly reason: unknown) {
  }

  get isOff(): true {
    return true;
  }

  off(_supply: Supply, _reason?: unknown): void {
    // Already off.
  }

  whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    callback(this.reason);
  }

}

const SupplyState$done = (/*#__PURE__*/ new SupplyState$Off(void 0));

export function SupplyState$off(reason: unknown): SupplyState {
  return reason === undefined ? SupplyState$done : new SupplyState$Off(reason);
}
