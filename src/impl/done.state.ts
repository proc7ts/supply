import type { Supply } from '../supply';
import type { SupplyState } from './state';

export const SupplyState$done: SupplyState = {
  isOff: true,
  off: SupplyState$done$off,
  whenOff(_supply: Supply, callback: (reason?: unknown) => void) {
    callback();
  },
};

export function SupplyState$done$off(_supply: Supply, _reason?: unknown): void {
  /* no off */
}
