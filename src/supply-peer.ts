import type { Supply } from './supply';

/**
 * A peer of supply, i.e. a supply participant. E.g. supplier or consumer.
 *
 * Multiple peers may share the same supply. A supply is a peer of itself.
 */
export interface SupplyPeer {

  /**
   * A supply this peer takes part in.
   */
  readonly supply: Supply;

}
