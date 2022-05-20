import type { SupplyPeer } from './supply-peer.js';
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

  override cuts(another: SupplyPeer): this {
    another.supply.off();

    return this;
  }

  override needs(_another: SupplyPeer): this {
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
