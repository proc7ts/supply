import { FnSupplyReceiver } from './impl/mod.js';
import { SupplyIsOff } from './supply-is-off.js';

/**
 * Supply receiver is informed when supply {@link Supply.off cut off}.
 *
 * When {@link Supplier.alsoOff registered} in supplier, the latter calls the {@link off} method once cut off,
 * unless the receiver is {@link isOff not available} anymore.
 *
 * Supply receivers may be used as a passive alternative to `removeEventListener` approach. While the latter can be used
 * to remove the listener in order to stop receiving events, the supply receiver may set itself {@link isOff
 * unavailable}, so that the supplier would be able to remove it occasionally.
 *
 * Note that any {@link Supply} may act as a supply receiver.
 *
 * @typeParam TResult - Supply result type.
 */
export interface SupplyReceiver<out TResult = void> {
  /**
   * Indicates whether this receiver is unavailable.
   *
   * It is expected that once this indicator set , it would never be reset.
   *
   * The supply would never call the {@link cutOff} method of this receiver, once this indicator set.
   *
   * The receiver with this indicator set will be ignored by supplier when trying {@link Supplier.alsoOff register} it.
   * Moreover, if this indicator set after the registration, the supplier may wish to remove it at any time.
   */
  readonly isOff: SupplyIsOff<TResult> | null;

  /**
   * Called by the source supply when the latter cut off.
   *
   * This method is called at least once, unless the receiver is {@link isOff unavailable}, in which case this
   * method would never be called.
   *
   * It is reasonable to set this property to no-op once the receiver becomes unavailable. This would release the
   * resources held by it, and help Garbage Collector to free them.
   *
   * @param reason - A reason indicating why the supply has been cut off, and when.
   */
  cutOff(reason: SupplyIsOff<TResult>): void;
}

/**
 * Supply receiver function signature.
 *
 * Can be passed to {@link Supply} constructor, or as a {@link Supply.whenOff} method parameter.
 *
 * Can be converted to {@link SupplyReceiver}.
 *
 * @typeParam TResult - Supply result type.
 * @param reason - A reason indicating why the supply has been cut off, and when.
 */
export type SupplyReceiverFn<out TResult = void> = <T extends TResult>(
  this: void,
  reason: SupplyIsOff<T>,
) => void;

/**
 * Converts a supply receiver function to supply receiver object.
 *
 * When called for `receiver` object, just returns it.
 *
 * @typeParam TResult - Supply result type.
 * @param receiver - Either receiver function to convert, or receiver object.
 *
 * @returns Supply receiver object that calls the given function when supply cut off at most once.
 */
export function SupplyReceiver<TResult = void>(
  receiver: SupplyReceiver<TResult> | SupplyReceiverFn<TResult>,
): SupplyReceiver<TResult> {
  return typeof receiver === 'function' ? new FnSupplyReceiver(receiver) : receiver;
}
