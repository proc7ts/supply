/**
 * Supply receiver is informed when supply {@link Supply.off cut off}.
 *
 * When {@link Supplier.to registered} in supplier, the latter calls the {@link off} method once cut off, unless the
 * receiver is {@link isOff not available} anymore.
 *
 * Supply receivers may be used as a passive alternative to `removeEventListener` approach. While the latter can be used
 * to remove the listener in order to stop receiving events, the supply receiver may set itself {@link isOff
 * unavailable}, so that the supplier would be able to remove it occasionally.
 *
 * Note that any {@link Supply} may act as a supply receiver.
 */
export interface SupplyReceiver {
  /**
   * Indicates whether this receiver is unavailable.
   *
   * It is expected that once this flag is set to `true`, it would never be reset.
   *
   * The supply would never call the {@link off} method of this receiver, once this flag is set.
   *
   * The receiver with this flag set will be ignored by supplier when trying {@link Supplier.to register} it.
   * Moreover, if this flag is set after the addition, the supplier may wish to remove it at any time.
   */
  readonly isOff: boolean;

  /**
   * Called by the source supply when the latter cut off.
   *
   * This method is called at least once, unless the receiver is {@link isOff unavailable}, in which case this
   * method would never be called.
   *
   * It is reasonable to set this property to no-op once the receiver becomes unavailable. This would release the
   * resources held by it, and help Garbage Collector to free them.
   *
   * @param reason - An optional reason why the supply is cut off. By convenience, an absent reason means the supply is
   * done successfully.
   */
  off(reason?: unknown): void;
}
