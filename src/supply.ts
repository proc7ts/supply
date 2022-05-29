import type { SupplyState } from './impl/mod.js';
import { Supply$unexpectedAbort$handle, SupplyState$NonReceiving, SupplyState$WithReceivers } from './impl/mod.js';
import { Supplier } from './supplier.js';
import { SupplyReceiver } from './supply-receiver.js';

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link off cut off}, and can {@link alsoOff inform} on cutting off.
 */
export class Supply implements Supplier, SupplyReceiver {

  /**
   * Assigns unexpected abort handler.
   *
   * When a supply {@link off aborted}, and there is no {@link whenOff cut off callback} registered, the given handler
   * will be called with the abort reason.
   *
   * By default, the unexpected abort reason will be logged to console.
   *
   * @param handler - A handler to call on unexpected abort, or `undefined` to reset to default one.
   */
  static onUnexpectedAbort(handler?: (this: void, reason: unknown) => void): void {
    Supply$unexpectedAbort$handle(handler);
  }

  #state: SupplyState;
  readonly #update = (state: SupplyState): void => { this.#state = state; };

  /**
   * Constructs new supply instance.
   *
   * @param off - A function to call when the supply is {@link Supply.off cut off}. Accepts optional cut off reason
   * as its only parameter. No-op by default.
   */
  constructor(off?: (this: void, reason?: unknown) => void) {
    this.#state = off ? new SupplyState$WithReceivers({ isOff: false, off }) : SupplyState$NonReceiving;
  }

  /**
   * Whether this supply is {@link off cut off} already.
   *
   * `true` means nothing will be supplied anymore.
   */
  get isOff(): boolean {
    return this.#state.isOff;
  }

  /**
   * The reason why supply is cut off. `undefined` while the supply is not cut off.
   */
  get whyOff(): unknown | undefined {
    return this.#state.whyOff;
  }

  /**
   * Cuts off this supply.
   *
   * After this method call nothing would be supplied anymore.
   *
   * Calling this method for the second time has no effect.
   *
   * @param reason - An optional reason why the supply is cut off. It will be reported to {@link whenOff} callbacks.
   * By convenience, an absent reason means the supply is done successfully.
   *
   * @returns The cut off supply instance.
   */
  off(reason?: unknown): Supply {
    this.#state.off(this.#update, reason);

    return this;
  }

  /**
   * Registers a callback function that will be called as soon as this supply is {@link off cut off}. This callback
   * will be called immediately if {@link isOff} is `true`.
   *
   * Calling this method is the same as calling `this.alsoOff({ isOff: false, off: callback, })`
   *
   * @param callback - A callback function accepting optional cut off reason as its only parameter.
   * By convenience an `undefined` reason means the supply is done successfully.
   *
   * @returns `this` instance.
   */
  whenOff(callback: (this: void, reason?: unknown) => void): this {
    return this.alsoOff({
      isOff: false,
      off: callback,
    });
  }

  /**
   * Builds a promise that will be resolved once this supply is {@link off done}.
   *
   * @returns A promise that will be successfully resolved once this supply is cut off without a reason, or rejected
   * once this supply is cut off with any reason except `undefined`.
   */
  whenDone(): Promise<void> {
    return new Promise((resolve, reject) => this.whenOff(
        reason => reason === undefined ? resolve() : reject(reason),
    ));
  }

  /**
   * Registers a receiver of this supply.
   *
   * Once this supply {@link off cut off}, the `receiver` will be {@link SupplyReceiver.off informed} on that,
   * unless it is {@link SupplyReceiver.isOff unavailable} already.
   *
   * Does nothing if the given `receiver` is {@link SupplyReceiver.isOff unavailable} already.
   *
   * @param receiver - Supply receiver to register.
   *
   * @returns `this` instance.
   */
  alsoOff(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      this.#state.alsoOff(this.#update, receiver);
    }

    return this;
  }

  derive(derived?: undefined): Supply;
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver): TReceiver;
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver | undefined): TReceiver | Supply;

  /**
   * Creates derived supply depending on this one.
   *
   * If derived supply receiver specified, makes it depend on this one.
   *
   * In contrast to {@link alsoOff} method, this one returns derived supply receiver.
   *
   * @typeParam TReceiver - Type of supply receiver.
   * @param derived - Optional derived supply receiver to make dependent on this one.
   *
   * @returns Derived supply receiver.
   */
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver | Supply = new Supply()): TReceiver | Supply {
    this.alsoOff(derived);

    return derived;
  }

  /**
   * Makes this supply depend on another supplier.
   *
   * Once the `supplier` {@link Supplier.alsoOff cuts off} the supply, this supply will be cut off with the same reason.
   *
   * Calling this method has the same effect as calling `supplier.alsoOff(this)`.
   *
   * @param supplier - A supplier to make this supply depend on.
   *
   * @returns `this` instance.
   */
  needs(supplier: Supplier): this {
    supplier.alsoOff(this);

    return this;
  }

  require(required?: undefined): Supply;
  require<TSupplier extends Supplier>(required: TSupplier): TSupplier;
  require<TSupplier extends Supplier>(required: TSupplier | undefined): TSupplier | Supply;

  /**
   * Creates required supply this one depends on.
   *
   * If required supplier specified, makes this one depend on it.
   *
   * In contrast to {@link needs} method, this one returns required supply.
   *
   * @typeParam TSupplier - Type of required supplier.
   * @param required - Optional supplier to make this one depend on.
   *
   * @returns Required supplier.
   */
  require<TSupplier extends Supplier>(required: TSupplier | Supply = new Supply()): TSupplier | Supply {
    required.alsoOff(this);

    return required;
  }

  /**
   * Makes this and another supply depend on each other.
   *
   * Calling this method is the same as calling `this.needs(another).alsoOff(another)`.
   *
   * @param another - A supply to make this one to mutually depend on.
   *
   * @returns `this` instance.
   */
  as(another: SupplyReceiver & Supplier): this {
    return this.needs(another).alsoOff(another);
  }

}
