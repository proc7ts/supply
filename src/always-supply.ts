import { Supplier } from './supplier.js';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';
import { Supply } from './supply.js';

class AlwaysSupply extends Supply {

  override get isOff(): null {
    return null;
  }

  override cutOff(_reason: SupplyIsOff): this {
    return this;
  }

  override off(_reason?: unknown): this {
    return this;
  }

  override alsoOff(_receiver: SupplyReceiver): this {
    return this;
  }

  override whenOff(_receiver: SupplyReceiverFn): this {
    return this;
  }

  override needs(_supplier: Supplier): this {
    return this;
  }

  override as(_another: SupplyReceiver & Supplier): this {
    return this;
  }

}

const alwaysSupply$ = /*#__PURE__*/ new AlwaysSupply();

/**
 * Returns always-supply instance.
 *
 * The {@link Supply.cutOff} method of the returned supply does nothing.
 *
 * @returns A supply instance that can not be cut off.
 */
export function alwaysSupply(): Supply {
  return alwaysSupply$;
}

/**
 * Checks whether the given supply is an {@link AlwaysSupply | always-supply} instance.
 *
 * @param supply - A supply to check.
 *
 * @returns `true` is the given `supply` can not be cut off, or `false` otherwise.
 */
export function isAlwaysSupply(supply: Supply): boolean {
  return supply === alwaysSupply$;
}
