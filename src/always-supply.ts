import { Supply } from './supply';
import type { SupplyPeer } from './supply-peer';

/**
 * @internal
 */
class AlwaysSupply extends Supply {

  get isOff(): false {
    return false;
  }

  off(_reason?: unknown): Supply {
    return this;
  }

  whenOff(_callback: (this: void, reason?: unknown) => void): this {
    return this;
  }

  cuts(_another: SupplyPeer): this {
    return this;
  }

  needs(_another: SupplyPeer): this {
    return this;
  }

}

/**
 * @internal
 */
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
