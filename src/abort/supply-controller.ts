import { Supply } from '../supply.js';
import { abortSupplyBy } from './abort-supply-by.js';

/**
 * Supply controller is an `AbortController` that acts as a supplier and supply receiver.
 *
 * Cuts off the {@link Supply} once aborted and aborts once {@link Supply} cut off.
 */
export class SupplyController extends AbortController {

  readonly #supply: Supply;

  /**
   * Constructs supply controller.
   *
   * @param supply - Explicit controller supply. When omitted, a new supply will be created.
   */
  constructor(supply = new Supply()) {
    super();
    this.#supply = abortSupplyBy(this.signal, supply)
      .derive(supply)
      .whenOff(reason => this.abort(reason));
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
