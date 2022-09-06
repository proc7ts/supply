import { FnSupplyReceiver } from './impl/fn-supply-receiver.js';
import type { SupplyState } from './impl/mod.js';
import {
  Supply$unexpectedFailure$handle,
  SupplyState$NonReceiving,
  SupplyState$Receiving,
} from './impl/mod.js';
import { Supplier } from './supplier.js';
import { SupplyIsOff } from './supply-is-off.js';
import { SupplyReceiver, SupplyReceiverFn } from './supply-receiver.js';

/**
 * Default implementation of receiving side of {@link Supply supply}.
 *
 * It is informed on supply cut off.
 *
 * @typeParam TResult - Supply result type.
 */
class SupplyIn$<in out TResult> implements SupplyIn<TResult> {

  #state: SupplyState<TResult>;
  readonly #update = (state: SupplyState<TResult>): void => {
    this.#state = state;
  };

  constructor(
    setup?: (alsoOff: (receiver: SupplyReceiver<TResult>) => void) => void,
    receiver?: SupplyReceiver<TResult> | SupplyReceiverFn<TResult>,
  ) {
    this.#state = receiver
      ? new SupplyState$Receiving(SupplyReceiver(receiver))
      : SupplyState$NonReceiving;
    setup?.(receiver => this.#state.alsoOff(this.#update, receiver));
  }

  get isOff(): SupplyIsOff<TResult> | null {
    return this.#state.isOff;
  }

  get supplyIn(): SupplyIn<TResult> {
    return this;
  }

  cutOff(reason: SupplyIsOff<TResult>): this {
    this.#state.off(this.#update, reason);

    return this;
  }

  done(result: TResult): this {
    return this.cutOff(SupplyIsOff.successfully(result));
  }

  fail(reason: unknown): this {
    return this.cutOff(SupplyIsOff.faultily(reason));
  }

  off<TReason>(...reason: SupplyIsOff.ReasonArgs<TResult, TReason>): this {
    return this.cutOff(SupplyIsOff.becauseOf(...reason));
  }

  needs(supplier: Supplier<TResult>): this {
    supplier.alsoOff(this);

    return this;
  }

  require(required?: undefined): Supply;
  require<TSupplier extends Supplier<TResult>>(required: TSupplier): TSupplier;
  require<TSupplier extends Supplier<TResult>>(
    required: TSupplier | undefined,
  ): TSupplier | Supply<TResult>;

  require<TSupplier extends Supplier<TResult>>(
    required: TSupplier | Supply<TResult> = new Supply(),
  ): TSupplier | Supply<TResult> {
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
export const SupplyIn: new <TResult = void>(
  setup?: (alsoOff: (receiver: SupplyReceiver<TResult>) => void) => void,
  receiver?: SupplyReceiver<TResult> | SupplyReceiverFn<TResult>,
) => SupplyIn<TResult> = SupplyIn$;

class SupplyOut$<in out TResult> implements SupplyOut<TResult> {

  readonly #alsoOff: (receiver: SupplyReceiver<TResult>) => void;

  constructor(alsoOff: (receiver: SupplyReceiver<TResult>) => void) {
    this.#alsoOff = alsoOff;
  }

  get supplyOut(): SupplyOut<TResult> {
    return this;
  }

  alsoOff(receiver: SupplyReceiver<TResult>): this {
    if (!receiver.isOff) {
      this.#alsoOff(receiver);
    }

    return this;
  }

  whenOff(receiver: SupplyReceiverFn<TResult>): this {
    return this.alsoOff(new FnSupplyReceiver(receiver));
  }

  whenDone(): Promise<TResult> {
    return new Promise((resolve, reject) => {
      this.whenOff(reason => {
        if (reason.failed) {
          reject(reason.error);
        } else {
          resolve(reason.result!);
        }
      });
    });
  }

  derive(derived?: undefined): Supply<TResult>;
  derive<TReceiver extends SupplyReceiver<TResult>>(derived: TReceiver): TReceiver;
  derive<TReceiver extends SupplyReceiver<TResult>>(
    derived: TReceiver | undefined,
  ): TReceiver | Supply<TResult>;

  derive<TReceiver extends SupplyReceiver<TResult>>(
    derived: TReceiver | Supply<TResult> = new Supply(),
  ): TReceiver | Supply<TResult> {
    this.alsoOff(derived);

    return derived;
  }

}

/**
 * Constructs sending side of supply.
 *
 * @constructor
 * @param alsoOff - A function that registers a receiver of this supply. It will be used as a
 * {@link SupplyOut:interface#alsoOff} method implementation.
 */
export const SupplyOut: new <TResult = void>(
  alsoOff: (receiver: SupplyReceiver<TResult>) => void,
) => SupplyOut<TResult> = SupplyOut$;

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link Supply#off cut off}, and can {@link Supply#alsoOff inform} on cutting off.
 */
export class Supply<in out TResult = void> extends SupplyOut<TResult> implements SupplyIn<TResult> {

  /**
   * Creates split sides of supply.
   *
   * @param receiver - Optional supply receiver.
   *
   * @returns A tuple containing {@link SupplyIn input} and {@link SupplyOut output} sides of supply connected to
   * each other.
   */
  static split<TResult>(
    receiver?: SupplyReceiver<TResult> | SupplyReceiverFn<TResult>,
  ): [supplyIn: SupplyIn<TResult>, supplyOut: SupplyOut<TResult>] {
    let alsoOff!: (receiver: SupplyReceiver<TResult>) => void;

    return [
      new SupplyIn(newAlsoOff => {
        alsoOff = newAlsoOff;
      }, receiver),
      new SupplyOut(alsoOff),
    ];
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

  readonly #in: SupplyIn<TResult>;
  #out?: SupplyOut<TResult>;

  /**
   * Constructs new supply instance.
   *
   * @param receiver - Optional supply receiver.
   */
  constructor(receiver?: SupplyReceiver<TResult> | SupplyReceiverFn<TResult>) {
    let alsoOff!: (receiver: SupplyReceiver<TResult>) => void;

    const supplyIn = new SupplyIn(newAlsoOff => {
      alsoOff = newAlsoOff;
    }, receiver);

    super(alsoOff);

    this.#in = supplyIn;
  }

  get isOff(): SupplyIsOff<TResult> | null {
    return this.#in.isOff;
  }

  get supplyIn(): SupplyIn<TResult> {
    return this.#in;
  }

  override get supplyOut(): SupplyOut<TResult> {
    return (this.#out ??= new SupplyOut(this.alsoOff.bind(this)));
  }

  cutOff(reason: SupplyIsOff<TResult>): this {
    this.#in.cutOff(reason);

    return this;
  }

  done(result: TResult): this {
    this.#in.done(result);

    return this;
  }

  fail(reason: unknown): this {
    this.#in.fail(reason);

    return this;
  }

  off<TReason>(...reason: SupplyIsOff.ReasonArgs<TResult, TReason>): this {
    this.#in.off(...reason);

    return this;
  }

  /**
   * Makes this supply depend on another supplier.
   *
   * Once the `supplier` {@link Supplier#alsoOff cuts off} the supply, this supply will be cut off with the same reason.
   *
   * Calling this method has the same effect as calling `supplier.alsoOff(this)`.
   *
   * @param supplier - A supplier to make this supply depend on.
   *
   * @returns `this` instance.
   */
  needs(supplier: Supplier<TResult>): this {
    this.#in.needs(supplier);

    return this;
  }

  /**
   * Creates required supply this one depends on.
   *
   * @returns New required supplier.
   */
  require(required?: undefined): Supply<TResult>;

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
  require<TSupplier extends Supplier<TResult>>(required: TSupplier): TSupplier;

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
  require<TSupplier extends Supplier<TResult>>(
    required: TSupplier | undefined,
  ): TSupplier | Supply<TResult>;

  require<TSupplier extends Supplier<TResult>>(
    required: TSupplier | undefined,
  ): TSupplier | Supply<TResult> {
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
  as(another: SupplyReceiver<TResult> & Supplier<TResult>): this {
    return this.needs(another).alsoOff(another);
  }

}

/**
 * Receiving side of {@link Supply supply}.
 *
 * It is informed on supply cut off.
 *
 * @typeParam TResult - Supply result type.
 */
export interface SupplyIn<in out TResult = void> extends SupplyReceiver<TResult> {
  /**
   * Indicates whether this supply is {@link off cut off} already.
   *
   * `null` initially. Set once supply {@link off cut off}. Once set, nothing will be supplied anymore.
   */
  get isOff(): SupplyIsOff<TResult> | null;

  /**
   * Receiving side of this supply.
   */
  get supplyIn(): SupplyIn<TResult>;

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
  cutOff(reason: SupplyIsOff<TResult>): this;

  /**
   * Completes this supply successfully with the given result.
   *
   * Calling this method is the same as calling `this.cutOff(SupplyIsOff.successfully(result))`.
   *
   * @param result - Supply result.
   *
   * @returns `this` instance.
   */
  done(result: TResult): this;

  /**
   * Terminates this supply faultily.
   *
   * Calling this method is the same as calling `this.cutOff(SupplyIsOff.faultily(reason))`.
   *
   * @param reason - Supply failure reason.
   *
   * @returns `this` instance.
   */
  fail(reason: unknown): this;

  /**
   * Cuts off this supply with arbitrary reason.
   *
   * Calling this method is the same as calling `this.cutOff(SupplyIsOff.becauseOf(reason))`.
   *
   * @typeParam - Type of cut off reason.
   * @param reason - An optional reason why the supply is cut off. This reason {@link SupplyIsOff.becauseOf converted}
   * to supply cut off {@link isOff indicator}. By convenience, `undefined` or missing `reason` means successful supply
   * completion.
   *
   * @returns `this` instance.
   */
  off<TReason>(...reason: SupplyIsOff.ReasonArgs<TResult, TReason>): this;

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
  needs(supplier: Supplier<TResult>): this;

  /**
   * Creates required supply this one depends on.
   *
   * @returns New required supply instance.
   */
  require(required?: undefined): Supply<TResult>;

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
  require<TSupplier extends Supplier<TResult>>(required: TSupplier): TSupplier;

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
  require<TSupplier extends Supplier<TResult>>(
    required: TSupplier | undefined,
  ): TSupplier | Supply<TResult>;
}

/**
 * Sending side of {@link Supply supply}.
 *
 * It informs on supply cut off.
 *
 * @typeParam TResult - Supply result type.
 */
export interface SupplyOut<in out TResult = void> extends Supplier<TResult> {
  /**
   * Sending side of this supply.
   */
  get supplyOut(): SupplyOut<TResult>;

  /**
   * Registers a receiver of this supply.
   *
   * Once this supply {@link Supply#off cut off}, the `receiver` will be {@link SupplyReceiver#cutOff informed}
   * on that, unless it is {@link SupplyReceiver#isOff unavailable} already.
   *
   * Does nothing if the given `receiver` is {@link SupplyReceiver#isOff unavailable} already.
   *
   * @param receiver - Supply receiver to register.
   *
   * @returns `this` instance.
   */
  alsoOff(receiver: SupplyReceiver<TResult>): this;

  /**
   * Registers a supply receiver function that will be called as soon as this supply {@link Supply#off cut off}.
   *
   * Calling this method is the same as calling `this.alsoOff(SupplyReceiver(receiver))`
   *
   * @param receiver - Supply receiver function accepting cut off indicator as its only parameter.
   *
   * @returns `this` instance.
   */
  whenOff(receiver: SupplyReceiverFn<TResult>): this;

  /**
   * Builds a promise that will be resolved once this supply is {@link Supply#off done}. This callback will be called
   * immediately if supply is {@link Supply#isOff cut off} already.
   *
   * @returns A promise that will be successfully resolved once this supply completes {@link SupplyIsOff.Successfully
   * successfully}, or rejected with failure {@link SupplyIsOff.Faultily#error reason}.
   */
  whenDone(): Promise<TResult>;

  /**
   * Creates derived supply depending on this one.
   *
   * @returns New derived supply instance.
   */
  derive(derived?: undefined): Supply<TResult>;

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
  derive<TReceiver extends SupplyReceiver<TResult>>(derived: TReceiver): TReceiver;

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
  derive<TReceiver extends SupplyReceiver<TResult>>(
    derived: TReceiver | undefined,
  ): TReceiver | Supply<TResult>;
}
