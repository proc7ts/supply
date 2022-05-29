import { Supplier } from './supplier.js';
import { SupplyReceiver } from './supply-receiver.js';
import { Supply } from './supply.js';

class NeverSupply extends Supply {

  override get isOff(): true {
    return true;
  }

  override off(): this {
    return this;
  }

  override whenOff(callback: (reason?: any) => void): this {
    callback();

    return this;
  }

  override alsoOff(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      receiver.off();
    }

    return this;
  }

  override needs(_supplier: Supplier): this {
    return this;
  }

}

const neverSupply$ = (/*#__PURE__*/ new NeverSupply());

/**
 * Builds a never-supply instance.
 *
 * @returns A supply instance that is already cut off without any particular reason.
 */
export function neverSupply(): Supply {
  return neverSupply$;
}
