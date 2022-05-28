import { SupplyTarget } from './supply-target.js';

/**
 * Supplier informs when supply is cut off.
 */
export interface Supplier {

  /**
   * Whether this supply is {@link Supply.off cut off} already.
   *
   * `true` means nothing will be supplied anymore.
   */
  readonly isOff: boolean;

  /**
   * The reason why supply is cut off. `undefined` while the supply is not cut off.
   */
  reason: unknown | undefined;

  /**
   * Registers a target of the supply.
   *
   * Once the supply is {@link Supply.off cut off}, the `target` will be {@link SupplyTarget.off informed} on that,
   * unless it is {@link SupplyTarget.isOff unavailable} already.
   *
   * Does nothing if the given `target` is {@link SupplyTarget.isOff} is unavailable already.
   *
   * @param target - Supply target to register.
   */
  to(target: SupplyTarget): void;

}
