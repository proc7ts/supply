import { type SupplyPeer } from '../supply-peer.js';
import { Supply } from '../supply.js';
import { abortSupplyBy } from './abort-supply-by.js';
import { SupplyAbortError } from './supply-abort.error.js';

/**
 * Supply controller is an `AbortController` that acts as a supply peer.
 *
 * Cuts off the { @link #supply} once aborted and aborts once {@link supply} cut off.
 */
export class SupplyController extends AbortController implements SupplyPeer {

  readonly #supply: Supply;

  /**
   * Constructs supply controller.
   *
   * @param target - Target {@link supply} peer. When omitted, a new supply will be created.
   */
  constructor(target?: SupplyPeer) {
    super();
    this.#supply = abortSupplyBy(this.signal, target)
        .whenOff((reason = new SupplyAbortError) => this.abort(reason));
  }

  /**
   * The supply representing the state of this controller.
   *
   * This supply is cut off once controller sends an abort signal.
   *
   * When this supply is cut off, the controller sends an abort signal.
   */
  get supply(): Supply {
    return this.#supply;
  }

}
