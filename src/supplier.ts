import { SupplyReceiver } from './supply-receiver.js';

/**
 * Supplier informs the receivers when supply is cut off.
 *
 * Note that any {@link Supply} may act as a supplier.
 *
 * @typeParam TResult - Supply result type.
 */
export interface Supplier<out TResult = void> {

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
  alsoOff(receiver: SupplyReceiver<TResult>): void;

}
