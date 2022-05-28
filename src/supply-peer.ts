import type { Supplier } from './supplier.js';
import type { SupplyReceiver } from './supply-receiver.js';
import type { Supply } from './supply.js';

/**
 * A peer of supply, i.e. a supply participant. E.g. supplier or consumer.
 *
 * Multiple peers may share the same supply. A supply is a peer of itself.
 *
 * @typeParam TPeer - Type of supply peer. I.e. either supplier or consumer. {@link Supply} by default.
 */
export interface SupplyPeer<TPeer extends Supplier | SupplyReceiver = Supply> {

  /**
   * A supply this peer takes part in.
   */
  readonly supply: TPeer;

}
