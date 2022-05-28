import type { SupplyState } from './impl/mod.js';
import { Supply$unexpectedAbort$handle, SupplyState$0t, SupplyState$1t } from './impl/mod.js';
import type { SupplyPeer } from './supply-peer.js';
import { SupplyTarget } from './supply-target.js';

/**
 * Supply handle.
 *
 * Represents a supply of something.
 *
 * The supply can be {@link off cut off}, and can {@link whenOff inform} on cutting off.
 */
export class Supply implements SupplyTarget, SupplyPeer {

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
    this.#state = off ? new SupplyState$1t({ isOff: false, off }) : SupplyState$0t;
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
   * `true` means nothing would be supplied anymore.
   */
  get isOff(): boolean {
    return this.#state.isOff;
  }

  /**
   * The reason why supply is cut off. `undefined` when the supply is not cut off.
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
   * Registers a target of this supply.
   *
   * Once this supply is {@link off cut off}, the `target` will be {@link SupplyTarget.off informed} on that, unless it
   * become {@link SupplyTarget.isOff unavailable} at that time.
   *
   * Does nothing if the given `target` is {@link SupplyTarget.isOff} is unavailable already.
   *
   * Note that {@link whenOff} and {@link cuts} methods call this one by default.
   *
   * @param target - Supply target to add.
   *
   * @returns `this` instance.
   */
  to(target: SupplyTarget): this {
    if (!target.isOff) {
      this.#state.to(this.#update, target);
    }

    return this;
  }

  /**
   * Makes another supply depend on this one.
   *
   * Once this supply is {@link off cut off}, `another` one will be cut off with the same reason.
   *
   * Calling this method has the same effect as calling `this.to(another.supply)`.
   *
   * @param another - A supply peer to make dependent on this one.
   *
   * @returns `this` instance.
   */
  cuts(another: SupplyPeer): this {
    return this.to(another.supply);
  }

  /**
   * Creates derived supply depending on this one.
   *
   * If derived supply peer specified, makes it depend on this one.
   *
   * In contrast to {@link cuts} method, this one returns derived supply.
   *
   * @param derived - Optional derived supply peer to make dependent on this one.
   *
   * @returns Derived supply.
   */
  derive(derived?: SupplyPeer): Supply {
    return (derived ? derived.supply : new Supply()).needs(this);
  }

  /**
   * Makes this supply depend on another one.
   *
   * Once `another` supply is {@link off cut off}, this one will be cut off with the same reason.
   *
   * Calling this method has the same effect as calling `another.supply.cuts(this)`.
   *
   * @param another - A supply peer to make this one depend on.
   *
   * @returns `this` instance.
   */
  needs(another: SupplyPeer): this {
    another.supply.cuts(this);

    return this;
  }

  /**
   * Creates required supply this one depends on.
   *
   * If required supply peer specified, makes this one depend on it.
   *
   * In contrast to {@link needs} method, this one returns required supply.
   *
   * @param required - Optional required supply peer to make this one depend on.
   *
   * @returns Required supply.
   */
  require(required?: SupplyPeer): Supply {
    return (required ? required.supply : new Supply()).cuts(this);
  }

  /**
   * Makes this and another supply depend on each other.
   *
   * Calling this method is the same as calling `.needs(another).cuts(another)`.
   *
   * @param another - A supply peer to make this one to mutually depend on.
   *
   * @returns `this` instance.
   */
  as(another: SupplyPeer): this {
    return this.needs(another).cuts(another);
  }

}
