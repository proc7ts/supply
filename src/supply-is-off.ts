let SupplyIsOff$rev = 0;

/**
 * An indicator of supply {@link Supply.isOff cut off}.
 *
 * Indicates why the supply has been cut off (i.e. due to failure or successful completion), and when this happened.
 */
export class SupplyIsOff {

  /**
   * Creates a supply cut off reason indicator caused by the given `reason`.
   *
   * - If the `reason` is an indicator already, just returns it.
   * - Otherwise, if the `reason` is `undefined`, then creates new successful supply cut off indicator.
   * - Otherwise, creates new failed supply cut off indicator, and uses the `reason` as supply failure {@link error}.
   *
   * @param reason - Supply cut off reason.
   *
   * @returns Supply cut off indicator cause by `reason`.
   */
  static becauseOf(reason?: unknown): SupplyIsOff {
    return isSupplyIsOff(reason)
        ? reason
        : reason === undefined
            ? new SupplyIsOff({ failed: false })
            : new SupplyIsOff({ error: reason });
  }

  readonly #failed: boolean;
  readonly #error: unknown | undefined;
  readonly #whenOff: number;

  /**
   * Constructs an indicator.
   *
   * @param init - Initialization parameters. Successful supply completion indicator
   */
  constructor(init?: SupplyIsOff.Init);

  /**
   * Constructs an indicator derived from the `base` one.
   *
   * Constructed indicator will indicate cut off happened {@link sameTimeAs at the same time} as the `base` one.
   *
   * @param base - Base indicator to derive from.
   * @param init - Initialization parameters overriding corresponding values from the `base` indicator.
   */
  constructor(base: SupplyIsOff, init: SupplyIsOff.AnyInit);

  constructor(initOrBase: SupplyIsOff | SupplyIsOff.Init | undefined, optionalInit?: SupplyIsOff.AnyInit) {
    if (!initOrBase) {
      this.#failed = false;
      this.#whenOff = ++SupplyIsOff$rev;
    } else {

      let base: SupplyIsOff | undefined;
      let init: SupplyIsOff.AnyInit;

      if (optionalInit) {
        base = initOrBase as SupplyIsOff;
        init = optionalInit;
        this.#whenOff = base.#whenOff;
      } else {
        init = initOrBase as SupplyIsOff.Init;
        this.#whenOff = ++SupplyIsOff$rev;
      }

      const { error = base?.error, failed = error !== undefined || base?.failed || false } = init;

      this.#failed = failed;
      this.#error = failed ? error : undefined;
    }
  }

  /**
   * Whether the supply has failed.
   *
   * When `true`, the {@link error} property contains a failure reason.
   */
  get failed(): boolean {
    return this.#failed;
  }

  /**
   * An error indicating supply failure reason.
   *
   * Contains value only when {@link failed} property is `true`. Contains `undefined` value otherwise.
   */
  get error(): unknown | undefined {
    return this.#error;
  }

  /**
   * A reference to itself.
   *
   * Use to detect a supply cut off indicator.
   */
  get isOff(): this {
    return this;
  }

  /**
   * Whether indicated cut off happened at the same time as `another` one.
   *
   * The supplies depending on the one cut off initially, considered cut off at the same time.
   *
   * @param another - Another cut off indicator.
   */
  sameTimeAs(another: SupplyIsOff): boolean {
    return another.#whenOff === this.#whenOff;
  }

  toString(): string {
    return this.failed
        ? `SupplyIsOff.Faultily#${this.#whenOff}(error: ${this.error})`
        : `SupplyIsOff.Successfully#${this.#whenOff}`;
  }

}

function isSupplyIsOff(reason: unknown): reason is SupplyIsOff {
  return typeof reason === 'object' && !!reason && (reason as Partial<SupplyIsOff>).isOff === reason;
}

export namespace SupplyIsOff {

  /**
   * Initialization parameters of supply cut off {@link SupplyIsOff indicator}.
   *
   * Provides either success of failure indication.
   */
  export type Init = FailureInit | SuccessInit;

  /**
   * Initialization parameters of arbitrary supply cut off {@link SupplyIsOff indicator}.
   */
  export interface AnyInit {

    /**
     * Whether supply failed.
     *
     * Defaults to `true` if {@link error} is also specified.
     */
    readonly failed?: boolean | undefined;

    /**
     * An error indicating supply failure reason.
     *
     * Ignored when {@link failed} flag set to `false`.
     */
    readonly error?: unknown | undefined;

  }

  /**
   * Initialization parameters of failed supply cut off {@link SupplyIsOff indicator}.
   */
  export interface FailureInit extends AnyInit {

    /**
     * Either `true` or `undefined`, which means the supply failed.
     */
    readonly failed?: true | undefined;

    /**
     * An error indicating supply failure reason.
     */
    readonly error: unknown;

  }

  /**
   * Initialization parameters of successful supply cut off {@link SupplyIsOff indicator}.
   */
  export interface SuccessInit extends AnyInit {

    /**
     * Always `false`, which means the supply succeed.
     */
    readonly failed?: false | undefined;

    /**
     * Always ignored.
     */
    readonly error?: undefined;

  }

  /**
   * An indicator of failed supply {@link Supply.isOff cut off}.
   */
  export interface Faultily extends SupplyIsOff {

    get failed(): true;

    get error(): unknown;

  }

  /**
   * An indicator of successful supply {@link Supply.isOff cut off}.
   */
  export interface Successfully extends SupplyIsOff {

    get failed(): false;

    get error(): undefined;

  }

}
