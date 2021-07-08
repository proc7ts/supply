import type { Supply } from '../supply';
import { SupplyState$done, SupplyState$Done } from './done.state';
import type { SupplyState } from './state';

class SupplyState$Off extends SupplyState$Done {

  constructor(private readonly _reason: unknown) {
    super();
  }

  override whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    callback(this._reason);
  }

}

export function SupplyState$off(reason: unknown): SupplyState {
  return reason === undefined ? SupplyState$done : new SupplyState$Off(reason);
}
