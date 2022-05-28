import { SupplyReceiver } from './supply-receiver.js';

/**
 * Supplier informs the receivers when supply is cut off.
 *
 * Note that any {@link Supply} may act as a supplier.
 */
export interface Supplier {

  /**
   * Whether the supply is {@link Supply.off cut off} already.
   *
   * `true` means nothing will be supplied anymore.
   */
  readonly isOff: boolean;

  /**
   * The reason why the supply is cut off. `undefined` while the supply is not cut off.
   */
  reason?: unknown | undefined;

  /**
   * Registers a receiver of the supply.
   *
   * Once the supply {@link Supply.off cut off}, the `receiver` will be {@link SupplyReceiver.off informed} on that,
   * unless it is {@link SupplyReceiver.isOff unavailable} already.
   *
   * Does nothing if the given `receiver` is {@link SupplyReceiver.isOff unavailable} already.
   *
   * @param receiver - Supply receiver to register.
   */
  to(receiver: SupplyReceiver): void;

}
