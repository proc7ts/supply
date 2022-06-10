import { SupplyReceiver } from '../supply-receiver.js';
import type { SupplyState } from './supply-state.js';
import { Supply$off$unexpected, SupplyState$On } from './supply-state.on.js';
import { SupplyState$Receiving } from './supply-state.receiving.js';

class SupplyState$NonReceiving$ extends SupplyState$On {

  override alsoOff(update: (state: SupplyState) => void, receiver: SupplyReceiver): void {
    update(new SupplyState$Receiving(receiver));
  }

  protected override _off(reason: unknown): void {
    Supply$off$unexpected(reason);
  }

}

export const SupplyState$NonReceiving = (/*#__PURE__*/ new SupplyState$NonReceiving$);
