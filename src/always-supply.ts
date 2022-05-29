import { Supplier } from './supplier.js';
import { SupplyReceiver } from './supply-receiver.js';
import { Supply } from './supply.js';

class AlwaysSupply extends Supply {

  override get isOff(): false {
    return false;
  }

  override off(_reason?: unknown): Supply {
    return this;
  }

  override whenOff(_callback: (this: void, reason?: unknown) => void): this {
    return this;
  }

  override alsoOff(_receiver: SupplyReceiver): this {
    return this;
  }

  override cuts(_receiver: SupplyReceiver): this {
    return this;
  }

  override needs(_supplier: Supplier): this {
    return this;
  }

  override as(_another: SupplyReceiver & Supplier): this {
    return this;
  }

}

const alwaysSupply$ = (/*#__PURE__*/ new AlwaysSupply());

/**
 * Builds an always-supply instance.
 *
 * The {@link Supply.off} method of the returned supply does nothing.
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
