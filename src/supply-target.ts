/**
 * Supply target is informed on supply {@link Supply.off cut off}.
 *
 * When {@link Supply.to added to} supply, the latter calls the {@link off} method once cut off, unless the target is
 * {@link isOff not available} anymore.
 *
 * Supply targets may be used as a passive alternative to `removeEventListener` approach. While the latter can be used
 * to remove the listener in order to stop receiving events, the supply target may set itself {@link isOff unavailable},
 * so that the source supply would be able to remove it occasionally.
 *
 * Note that any {@link Supply} may act as a supply target.
 */
export interface SupplyTarget {
  /**
   * Indicates whether this target is unavailable.
   *
   * It is expected that once this flag is set to `true`, it would never be reset.
   *
   * The supply would never call the {@link off} method of this target, once this flag is set.
   *
   * The target with this flag set will be ignored by supply when trying {@link Supply.to add it}. Moreover, if this
   * flag is set after the addition, the supply may wish to remove it at any time.
   */
  readonly isOff: boolean;

  /**
   * Called by the source supply when the latter cut off.
   *
   * This method is called at least once, unless the supply target is {@link isOff unavailable}, in which case this
   * method would never be called.
   *
   * It is reasonable to set this property to no-op once the target becomes unavailable. This would release the
   * resources held by it, and helps Garbage Collector to free them.
   *
   * @param reason - An optional reason why the supply is cut off. By convenience, an absent reason means the supply is
   * done successfully.
   */
  off(reason?: unknown): void;
}
