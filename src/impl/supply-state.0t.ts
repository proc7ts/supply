import { SupplyTarget } from '../supply-target.js';
import type { SupplyState } from './supply-state.js';
import { SupplyState$1t } from './supply-state.nt.js';
import { Supply$off$unexpected, SupplyState$On } from './supply-state.on.js';

class SupplyState$0t$ extends SupplyState$On {

  override to(update: (state: SupplyState) => void, target: SupplyTarget): void {
    update(new SupplyState$1t(target));
  }

  protected override _off(reason: unknown): void {
    Supply$off$unexpected(reason);
  }

}

export const SupplyState$0t = (/*#__PURE__*/ new SupplyState$0t$);
