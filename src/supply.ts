import type { SupplyState } from './impl/mod.js';
import { Supply$unexpectedAbort$handle, SupplyState$NonReceiving, SupplyState$WithReceivers } from './impl/mod.js';
import { Supplier } from './supplier.js';
import { SupplyReceiver } from './supply-receiver.js';

/**
 * Default implementation of receiving side of {@link Supply supply}.
 *
 * It is informed on supply cut off.
 */
export class SupplyIn implements Supply.In {

  #state: SupplyState;
  readonly #update = (state: SupplyState): void => { this.#state = state; };

  /**
   * Constructs receiving side of supply.
   *
   * @param off - A function to call when the supply is {@link Supply.off cut off}. Accepts optional cut off reason
   * as its only parameter. No-op by default.
   * @param setAlsoOff - An optional receiver of {@link Supplier.alsoOff} method implementation.
   */
  constructor(
      off?: (this: void, reason?: unknown) => void,
      setAlsoOff?: (alsoOff: (receiver: SupplyReceiver) => void) => void,
  ) {
    this.#state = off ? new SupplyState$WithReceivers({ isOff: false, off }) : SupplyState$NonReceiving;
    setAlsoOff?.(receiver => this.#state.alsoOff(this.#update, receiver));
  }

  get isOff(): boolean {
    return this.#state.isOff;
  }

  get whyOff(): unknown | undefined {
    return this.#state.whyOff;
  }

  get supplyIn(): Supply.In {
    return this;
  }

  off(reason?: unknown): this {
    this.#state.off(this.#update, reason);

    return this;
  }

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

}

/**
 * Default implementation of sending side of {@link Supply supply}.
 *
 * It informs on supply cut off.
 */
export class SupplyOut implements Supply.Out {

  readonly #alsoOff: (receiver: SupplyReceiver) => void;

  /**
   * Constructs sending side of supply.
   *
   * @param alsoOff - A function that registers a receiver of this supply. It will be used as a {@link alsoOff} method
   * implementation.
   */
  constructor(alsoOff: (receiver: SupplyReceiver) => void) {
    this.#alsoOff = alsoOff;
  }

  get supplyOut(): Supply.Out {
    return this;
  }

  alsoOff(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      this.#alsoOff(receiver);
    }

    return this;
  }

  whenOff(callback: (this: void, reason?: unknown) => void): this {
    return this.alsoOff({
      isOff: false,
      off: callback,
    });
  }

  whenDone(): Promise<void> {
    return new Promise((resolve, reject) => this.whenOff(
        reason => reason === undefined ? resolve() : reject(reason),
    ));
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

}

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link off cut off}, and can {@link alsoOff inform} on cutting off.
 */
export class Supply extends SupplyOut implements Supply.In {

  /**
   * Creates split sides of supply.
   *
   * @param off - A function to call when the supply is {@link Supply.off cut off}. Accepts optional cut off reason
   * as its only parameter. No-op by default.
   *
   * @returns A tuple containing {@link Supply.In input} and {@link Supply.Out output} sides of supply connected to
   * each other.
   */
  static split(off?: (this: void, reason?: unknown) => void): [supplyIn: Supply.In, supplyOut: Supply.Out] {

    let alsoOff!: (receiver: SupplyReceiver) => void;

    return [new SupplyIn(off, newAlsoOff => { alsoOff = newAlsoOff; }), new SupplyOut(alsoOff)];
  }

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

  readonly #in: SupplyIn;
  #out?: SupplyOut;

  /**
   * Constructs new supply instance.
   *
   * @param off - A function to call when the supply is {@link Supply.off cut off}. Accepts optional cut off reason
   * as its only parameter. No-op by default.
   */
  constructor(off?: (this: void, reason?: unknown) => void) {

    let alsoOff!: (receiver: SupplyReceiver) => void;

    const supplyIn = new SupplyIn(off, newAlsoOff => { alsoOff = newAlsoOff; });

    super(alsoOff);

    this.#in = supplyIn;
  }

  get isOff(): boolean {
    return this.#in.isOff;
  }

  get whyOff(): unknown | undefined {
    return this.#in.whyOff;
  }

  get supplyIn(): Supply.In {
    return this.#in;
  }

  override get supplyOut(): Supply.Out {
    return this.#out ??= new SupplyOut(this.alsoOff.bind(this));
  }

  off(reason?: unknown): this {
    this.#in.off(reason);

    return this;
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
    this.#in.needs(supplier);

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
  require<TSupplier extends Supplier>(required: TSupplier | undefined): TSupplier | Supply {
    return this.#in.require(required);
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

export namespace Supply {

  /**
   * Interface of receiving side of {@link Supply supply}.
   *
   * It is informed on supply cut off.
   */
  export interface In extends SupplyReceiver {
    /**
     * Whether this supply is {@link off cut off} already.
     *
     * `true` means nothing will be supplied anymore.
     */
    get isOff(): boolean;

    /**
     * The reason why supply is cut off. `undefined` while the supply is not cut off.
     */
    get whyOff(): unknown | undefined;

    /**
     * Receiving side of this supply.
     */
    get supplyIn(): Supply.In;

    /**
     * Cuts off this supply.
     *
     * After this method call nothing would be supplied anymore.
     *
     * Calling this method for the second time has no effect.
     *
     * @param reason - An optional reason why the supply is cut off.
     *
     * @returns `this` instance.
     */
    off(reason?: unknown): this;

    /**
     * Makes this supply depend on another supplier.
     *
     * Once the `supplier` {@link Supplier.alsoOff cuts off} the supply, this supply will be cut off with the same
     * reason.
     *
     * Calling this method has the same effect as calling `supplier.alsoOff(this)`.
     *
     * @param supplier - A supplier to make this supply depend on.
     *
     * @returns `this` instance.
     */
    needs(supplier: Supplier): this;

    require(required?: undefined): Supply;
    require<TSupplier extends Supplier>(required: TSupplier): TSupplier;

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
    require<TSupplier extends Supplier>(required: TSupplier | undefined): TSupplier | Supply;

  }

  /**
   * Interface of sending side of {@link Supply supply}.
   *
   * It informs on supply cut off.
   */
  export interface Out extends Supplier {

    /**
     * Sending side of this supply.
     */
    get supplyOut(): Supply.Out;

    /**
     * Registers a receiver of this supply.
     *
     * Once this supply {@link Supply.off cut off}, the `receiver` will be {@link SupplyReceiver.off informed} on that,
     * unless it is {@link SupplyReceiver.isOff unavailable} already.
     *
     * Does nothing if the given `receiver` is {@link SupplyReceiver.isOff unavailable} already.
     *
     * @param receiver - Supply receiver to register.
     *
     * @returns `this` instance.
     */
    alsoOff(receiver: SupplyReceiver): this;

    /**
     * Registers a callback function that will be called as soon as this supply is {@link Supply.off cut off}.
     *
     * Calling this method is the same as calling `this.alsoOff({ isOff: false, off: callback, })`
     *
     * @param callback - A callback function accepting optional cut off reason as its only parameter.
     * By convenience an `undefined` reason means the supply is done successfully.
     *
     * @returns `this` instance.
     */
    whenOff(callback: (this: void, reason?: unknown) => void): this;

    /**
     * Builds a promise that will be resolved once this supply is {@link Supply.off done}. This callback will be called
     * immediately if supply is {@link Supply.isOff cut off} already.
     *
     * @returns A promise that will be successfully resolved once this supply is cut off without a reason, or rejected
     * once this supply is cut off with any reason except `undefined`.
     */
    whenDone(): Promise<void>;

    derive(derived?: undefined): Supply;
    derive<TReceiver extends SupplyReceiver>(derived: TReceiver): TReceiver;

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
    derive<TReceiver extends SupplyReceiver>(derived: TReceiver | undefined): TReceiver | Supply;

  }

}
