import { FnSupplyReceiver } from './impl/fn-supply-receiver.js';
import type { SupplyState } from './impl/mod.js';
import { Supply$unexpectedFailure$handle, SupplyState$NonReceiving, SupplyState$Receiving } from './impl/mod.js';
import { Supplier } from './supplier.js';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';

/**
 * Default implementation of receiving side of {@link Supply supply}.
 *
 * It is informed on supply cut off.
 */
class SupplyIn$ implements SupplyIn {

  #state: SupplyState;
  readonly #update = (state: SupplyState): void => { this.#state = state; };

  constructor(
      setup?: (alsoOff: (receiver: SupplyReceiver) => void) => void,
      receiver?: SupplyReceiver | SupplyReceiverFn,
  ) {
    this.#state = receiver
        ? new SupplyState$Receiving(SupplyReceiver(receiver))
        : SupplyState$NonReceiving;
    setup?.(receiver => this.#state.alsoOff(this.#update, receiver));
  }

  get isOff(): SupplyIsOff | null {
    return this.#state.isOff;
  }

  get supplyIn(): SupplyIn {
    return this;
  }

  cutOff(reason: SupplyIsOff): this {
    this.#state.off(this.#update, reason);

    return this;
  }

  off(reason?: unknown): this {
    return this.cutOff(SupplyIsOff.becauseOf(reason));
  }

  needs(supplier: Supplier): this {
    supplier.alsoOff(this);

    return this;
  }

  require(required?: undefined): Supply;
  require<TSupplier extends Supplier>(required: TSupplier): TSupplier;
  require<TSupplier extends Supplier>(required: TSupplier | undefined): TSupplier | Supply;
  require<TSupplier extends Supplier>(required: TSupplier | Supply = new Supply()): TSupplier | Supply {
    required.alsoOff(this);

    return required;
  }

}

/**
 * Constructs receiving side of supply.
 *
 * @param setup - An optional receiver of {@link Supplier.alsoOff} method implementation.
 * @param receiver - Optional supply receiver. Can be either an object, or a function.
 */
export const SupplyIn: new (
    setup?: (alsoOff: (receiver: SupplyReceiver) => void) => void,
    receiver?: SupplyReceiver | SupplyReceiverFn,
) => SupplyIn = SupplyIn$;

class SupplyOut$ implements SupplyOut {

  readonly #alsoOff: (receiver: SupplyReceiver) => void;

  constructor(alsoOff: (receiver: SupplyReceiver) => void) {
    this.#alsoOff = alsoOff;
  }

  get supplyOut(): SupplyOut {
    return this;
  }

  alsoOff(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      this.#alsoOff(receiver);
    }

    return this;
  }

  whenOff(receiver: SupplyReceiverFn): this {
    return this.alsoOff(new FnSupplyReceiver(receiver));
  }

  whenDone(): Promise<void> {
    return new Promise((resolve, reject) => this.whenOff(
        reason => reason.failed ? reject(reason.error) : resolve(),
    ));
  }

  derive(derived?: undefined): Supply;
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver): TReceiver;
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver | undefined): TReceiver | Supply;
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver | Supply = new Supply()): TReceiver | Supply {
    this.alsoOff(derived);

    return derived;
  }

}

/**
 * Constructs sending side of supply.
 *
 * @constructor
 * @param alsoOff - A function that registers a receiver of this supply. It will be used as a {@link alsoOff} method
 * implementation.
 */
export const SupplyOut: new (
    alsoOff: (receiver: SupplyReceiver) => void,
) => SupplyOut = SupplyOut$;

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link off cut off}, and can {@link alsoOff inform} on cutting off.
 */
export class Supply extends SupplyOut implements SupplyIn {

  /**
   * Creates split sides of supply.
   *
   * @param receiver - Optional supply receiver.
   *
   * @returns A tuple containing {@link SupplyIn input} and {@link SupplyOut output} sides of supply connected to
   * each other.
   */
  static split(receiver?: SupplyReceiver | SupplyReceiverFn): [supplyIn: SupplyIn, supplyOut: SupplyOut] {

    let alsoOff!: (receiver: SupplyReceiver) => void;

    return [new SupplyIn(newAlsoOff => { alsoOff = newAlsoOff; }, receiver), new SupplyOut(alsoOff)];
  }

  /**
   * Assigns unexpected supply failure handler.
   *
   * When a supply {@link off cut off} due to some {@link SupplyIsOff.Faultily failure}, and there is no
   * {@link alsoOff supply receiver} registered and still {@link SupplyReceiver.isOff available} to handle it,
   * the given `handler` will be called with failure indicator as its only parameter.
   *
   * By default, a warning with unexpected failure {@link SupplyIsOff.Faultily.error reason} will be issued to console.
   *
   * @param handler - A handler to call on unexpected failure, or `undefined` to reset to default one.
   */
  static onUnexpectedFailure(handler?: (this: void, reason: SupplyIsOff.Faultily) => void): void {
    Supply$unexpectedFailure$handle(handler);
  }

  readonly #in: SupplyIn;
  #out?: SupplyOut;

  /**
   * Constructs new supply instance.
   *
   * @param receiver - Optional supply receiver.
   */
  constructor(receiver?: SupplyReceiver | SupplyReceiverFn) {

    let alsoOff!: (receiver: SupplyReceiver) => void;

    const supplyIn = new SupplyIn(newAlsoOff => { alsoOff = newAlsoOff; }, receiver);

    super(alsoOff);

    this.#in = supplyIn;
  }

  get isOff(): SupplyIsOff | null {
    return this.#in.isOff;
  }

  get supplyIn(): SupplyIn {
    return this.#in;
  }

  override get supplyOut(): SupplyOut {
    return this.#out ??= new SupplyOut(this.alsoOff.bind(this));
  }

  cutOff(reason: SupplyIsOff): this {
    this.#in.cutOff(reason);

    return this;
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

  /**
   * Creates required supply this one depends on.
   *
   * @returns New required supplier.
   */
  require(required?: undefined): Supply;

  /**
   * Makes this supplier require depend on another one.
   *
   * In contrast to {@link needs} method, this one returns required supply.
   *
   * @typeParam TSupplier - Type of required supplier.
   * @param required - Optional supplier to make this one depend on.
   *
   * @returns Required supplier.
   */
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

/**
 * Receiving side of {@link Supply supply}.
 *
 * It is informed on supply cut off.
 */
export interface SupplyIn extends SupplyReceiver {

  /**
   * Indicates whether this supply is {@link off cut off} already.
   *
   * `null` initially. Set once supply {@link off cut off}. Once set, nothing will be supplied anymore.
   */
  get isOff(): SupplyIsOff | null;

  /**
   * Receiving side of this supply.
   */
  get supplyIn(): SupplyIn;

  /**
   * Cuts off this supply.
   *
   * When called for the first time, all registered supply receivers informed with the given `reason`, and {@link isOff}
   * property value becomes equal to it. Calling this method for the second time has no effect.
   *
   * After this method call nothing would be supplied anymore.
   *
   * @param reason - A reason indicating why the supply has been cut off, and when.
   *
   * @returns `this` instance.
   */
  cutOff(reason: SupplyIsOff): this;

  /**
   * Cuts off this supply with arbitrary reason.
   *
   * Calling this method is the same as calling `this.cutOff(SupplyIsOff.becauseOf(reason))`.
   *
   * @param reason - An optional reason why the supply is cut off. This reason {@link SupplyIsOff.becauseOf converted}
   * to supply cut off {@link isOff indicator}. By convenience, `undefined` or missing `reason` means successful supply
   * completion.
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

  /**
   * Creates required supply this one depends on.
   *
   * @returns New required supply instance.
   */
  require(required?: undefined): Supply;

  /**
   * Makes this supplier depend on another supplier.
   *
   * In contrast to {@link needs} method, this one returns required supplier.
   *
   * @typeParam TSupplier - Type of required supplier.
   * @param required - Supplier to make this supply depend on.
   *
   * @returns Required supplier.
   */
  require<TSupplier extends Supplier>(required: TSupplier): TSupplier;

  /**
   * Creates required supply this one depends on.
   *
   * If required supplier specified, makes this supply depend on it.
   *
   * In contrast to {@link needs} method, this one returns required supplier.
   *
   * @typeParam TSupplier - Type of required supplier.
   * @param required - Optional supplier to make this supply depend on.
   *
   * @returns Required supplier.
   */
  require<TSupplier extends Supplier>(required: TSupplier | undefined): TSupplier | Supply;

}

/**
 * Sending side of {@link Supply supply}.
 *
 * It informs on supply cut off.
 */
export interface SupplyOut extends Supplier {

  /**
   * Sending side of this supply.
   */
  get supplyOut(): SupplyOut;

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
   * Registers a supply receiver function that will be called as soon as this supply {@link Supply.off cut off}.
   *
   * Calling this method is the same as calling `this.alsoOff(SupplyReceiver(receiver))`
   *
   * @param receiver - Supply receiver function accepting cut off indicator as its only parameter.
   *
   * @returns `this` instance.
   */
  whenOff(receiver: SupplyReceiverFn): this;

  /**
   * Builds a promise that will be resolved once this supply is {@link Supply.off done}. This callback will be called
   * immediately if supply is {@link Supply.isOff cut off} already.
   *
   * @returns A promise that will be successfully resolved once this supply completes {@link SupplyIsOff.Successfully
   * successfully}, or rejected with failure {@link SupplyIsOff.Faultily.error reason}.
   */
  whenDone(): Promise<void>;

  /**
   * Creates derived supply depending on this one.
   *
   * @returns New derived supply instance.
   */
  derive(derived?: undefined): Supply;

  /**
   * Makes supply receiver depend on this supply.
   *
   * In contrast to {@link alsoOff} method, this one returns derived supply receiver.
   *
   * @typeParam TReceiver - Type of supply receiver.
   * @param derived - Derived supply receiver to make dependent on this supply.
   *
   * @returns Derived supply receiver.
   */
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver): TReceiver;

  /**
   * Creates derived supply depending on this supply.
   *
   * If derived supply receiver specified, makes it depend on this supply.
   *
   * In contrast to {@link alsoOff} method, this one returns derived supply receiver.
   *
   * @typeParam TReceiver - Type of supply receiver.
   * @param derived - Optional derived supply receiver to make dependent on this supply.
   *
   * @returns Derived supply receiver.
   */
  derive<TReceiver extends SupplyReceiver>(derived: TReceiver | undefined): TReceiver | Supply;

}
