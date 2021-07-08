import type { Supply } from '../supply';
import { SupplyState$done, SupplyState$done$off } from './done.state';
import type { SupplyState } from './state';

export function SupplyState$off(reason: unknown): SupplyState {
  if (reason === undefined) {
    return SupplyState$done;
  }

  return {
    isOff: true,
    off: SupplyState$done$off,
    whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
      callback(reason);
    },
  };
}
