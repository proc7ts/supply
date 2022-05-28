import type { SupplyState } from './impl/mod.js';
import { Supply$unexpectedAbort$handle, SupplyState$NonReceiving, SupplyState$WithReceivers } from './impl/mod.js';
import { Supplier } from './supplier.js';
import type { SupplyPeer } from './supply-peer.js';
import { SupplyReceiver } from './supply-receiver.js';

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link off cut off}, and can {@link whenOff inform} on cutting off.
 */
export class Supply implements Supplier, SupplyReceiver, SupplyPeer {

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

  /**
   * Extracts or creates a supply of the given `supplier`.
   *
   * @param supplier - Supplier peer.
   *
   * @returns Supply instance.
   */
  static supplying(this: void, supplier: SupplyPeer<Supplier>): Supply {

    const { supply } = supplier;

    return supply instanceof Supply ? supply : new Supply().needs(supplier);
  }

  /**
   * Extracts or creates a supply to the given `receiver`.
   *
   * @param receiver - Supply receiver.
   *
   * @returns Supply instance.
   */
  static receiving(this: void, receiver: SupplyPeer<SupplyReceiver>): Supply {

    const { supply } = receiver;

    return supply instanceof Supply ? supply : new Supply().to(supply);
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
   * `this` supply instance.
   */
  get supply(): this {
    return this;
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
  get reason(): unknown | undefined {
    return this.#state.reason;
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
   * Calling this method is the same as calling `this.to({ isOff: false, off: callback, })`
   *
   * @param callback - A callback function accepting optional cut off reason as its only parameter.
   * By convenience an `undefined` reason means the supply is done successfully.
   *
   * @returns `this` instance.
   */
  whenOff(callback: (this: void, reason?: unknown) => void): this {
    return this.to({
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
   * Note that {@link whenOff} and {@link cuts} methods call this one by default.
   *
   * @param receiver - Supply receiver to register.
   *
   * @returns `this` instance.
   */
  to(receiver: SupplyReceiver): this {
    if (!receiver.isOff) {
      this.#state.to(this.#update, receiver);
    }

    return this;
  }

  /**
   * Makes a receiver depend on this supply.
   *
   * Once this supply {@link off cut off}, the `receiver` will be informed on that with the same reason.
   *
   * Calling this method has the same effect as calling `this.to(consumer.supply)`.
   *
   * @param consumer - A supply consumer peer to make dependent on this supply.
   *
   * @returns `this` instance.
   */
  cuts(consumer: SupplyPeer<SupplyReceiver>): this {
    return this.to(consumer.supply);
  }

  /**
   * Creates derived supply depending on this one.
   *
   * If derived supply peer specified, makes it depend on this one.
   *
   * In contrast to {@link cuts} method, this one returns derived supply.
   *
   * @param derived - Optional derived supply consumer peer to make dependent on this one.
   *
   * @returns Derived supply.
   */
  derive(derived?: SupplyPeer<SupplyReceiver>): Supply {
    return (derived ? Supply.receiving(derived) : new Supply()).needs(this);
  }

  /**
   * Makes thi supply depend on another supplier.
   *
   * Once the `supplier` {@link Supplier.isOff cuts off} the supply, this supply will be cut off with the same reason.
   *
   * Calling this method has the same effect as calling `supplier.supply.to(this)`.
   *
   * @param supplier - A supplier peer to make this supply depend on.
   *
   * @returns `this` instance.
   */
  needs(supplier: SupplyPeer<Supplier>): this {
    supplier.supply.to(this);

    return this;
  }

  /**
   * Creates required supply this one depends on.
   *
   * If required supply peer specified, makes this one depend on it.
   *
   * In contrast to {@link needs} method, this one returns required supply.
   *
   * @param required - Optional supplier peer to make this one depend on.
   *
   * @returns Required supply.
   */
  require(required?: SupplyPeer<Supplier>): Supply {
    return (required ? Supply.supplying(required) : new Supply()).to(this);
  }

  /**
   * Makes this and another supply peer depend on each other.
   *
   * Calling this method is the same as calling `this.needs(another).cuts(another)`.
   *
   * @param another - A supply peer to make this one to mutually depend on.
   *
   * @returns `this` instance.
   */
  as(another: SupplyPeer<SupplyReceiver & Supplier>): this {
    return this.needs(another).cuts(another);
  }

}
