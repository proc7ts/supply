import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';
import { SupplyState$On } from './supply-state.on.js';
import { SupplyState$Receiving } from './supply-state.receiving.js';

class SupplyState$NonReceiving$ extends SupplyState$On<never> {

  override alsoOff(
    update: (state: SupplyState<never>) => void,
    receiver: SupplyReceiver<never>,
  ): void {
    update(new SupplyState$Receiving(receiver));
  }

  protected override _off(_reason: SupplyIsOff<never>): false {
    return false;
  }

}

export const SupplyState$NonReceiving = /*#__PURE__*/ new SupplyState$NonReceiving$();
