import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';
import { Supply, SupplyOut } from './supply.js';

/**
 * Creates supply that will be cut off upon give `promise` fulfillment.
 *
 * If the given `promise` resolves, the supply will be completed {@link Supply.done successfully} with resolved value.
 *
 * If the given `promise` rejects, the supply will be terminated {@link SupplyIn.fail faultily} with rejection reason.
 *
 * @param promise - Target promise.
 * @param receiver - Optional supply receiver.
 *
 * @returns Sending side of created supply.
 */
export function supplyWhile<T = void>(
  promise: Promise<T>,
  receiver?: SupplyReceiver<T> | SupplyReceiverFn<T>,
): SupplyOut<T> {
  const [supplyIn, supplyOut] = Supply.split(receiver);

  promise.then(
    value => supplyIn.done(value),
    error => supplyIn.fail(error),
  );

  return supplyOut;
}
