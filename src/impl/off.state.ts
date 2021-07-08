import type { Supply } from '../supply';
import { SupplyState } from './state';

class SupplyState$Off extends SupplyState {

  constructor(private readonly _reason: unknown) {
    super();
  }

  override get isOff(): true {
    return true;
  }

  off(_supply: Supply, _reason?: unknown): void {
    // Already off.
  }

  override whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    callback(this._reason);
  }

}

const SupplyState$done = (/*#__PURE__*/ new SupplyState$Off(void 0));

export function SupplyState$off(reason: unknown): SupplyState {
  return reason === undefined ? SupplyState$done : new SupplyState$Off(reason);
}
