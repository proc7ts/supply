import { Supply } from './supply';
import type { SupplyPeer } from './supply-peer';

/**
 * @internal
 */
class NeverSupply extends Supply {

  get isOff(): true {
    return true;
  }

  off(): this {
    return this;
  }

  whenOff(callback: (reason?: any) => void): this {
    callback();
    return this;
  }

  cuts(another: SupplyPeer): this {
    another.supply.off();
    return this;
  }

  needs(_another: SupplyPeer): this {
    return this;
  }

}

/**
 * @internal
 */
const neverSupply$ = (/*#__PURE__*/ new NeverSupply());

/**
 * Builds a never-supply instance.
 *
 * @returns A supply instance that is already cut off without any particular reason.
 */
export function neverSupply(): Supply {
  return neverSupply$;
}
