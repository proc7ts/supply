import { Supplier } from './supplier.js';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';
import { Supply } from './supply.js';

const neverSupply$isOff = /*#__PURE__*/ new SupplyIsOff();

class NeverSupply extends Supply {

  override get isOff(): SupplyIsOff {
    return neverSupply$isOff;
  }

  override cutOff(_reason: SupplyIsOff): this {
    return this;
  }

  override off(_reason?: unknown): this {
    return this;
  }

  override alsoOff(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      receiver.cutOff(this.isOff);
    }

    return this;
  }

  override whenOff(receiver: SupplyReceiverFn): this {
    receiver(this.isOff);

    return this;
  }

  override needs(_supplier: Supplier): this {
    return this;
  }

}

const neverSupply$ = /*#__PURE__*/ new NeverSupply();

/**
 * Returns never-supply instance.
 *
 * @returns A supply instance that is already cut off without any particular reason.
 */
export function neverSupply(): Supply {
  return neverSupply$;
}
