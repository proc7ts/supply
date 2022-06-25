let SupplyIsOff$rev = 0;

/**
 * An indicator of supply {@link Supply.isOff cut off}.
 *
 * Indicates why the supply has been cut off (i.e. due to failure or successful completion), and when this happened.
 *
 * @typeParam TResult - Supply result type.
 */
export class SupplyIsOff<out TResult = void> {

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
  static becauseOf<TReason, TResult = void>(
      this: void,
      ...[reason]: SupplyIsOff.ReasonArgs<TResult, TReason>
  ): SupplyIsOff<TResult> {
    return isSupplyIsOff<TResult>(reason)
        ? reason
        : reason === undefined
            ? new SupplyIsOff(undefined!)
            : new SupplyIsOff({ error: reason });
  }

  /**
   * Creates indicator of successfully completed supply.
   *
   * @param result - Supply result.
   *
   * @returns Success indicator.
   */
  static successfully<TResult = void>(this: void, result: TResult): SupplyIsOff.Successfully<TResult> {
    return new SupplyIsOff({ failed: false, result }) as SupplyIsOff.Successfully<TResult>;
  }

  /**
   * Creates indicator of faultily terminates supply.
   *
   * When `error` is a supply failure indicator, then returns this supply. Otherwise, it is used as an {@link error}
   * value.
   *
   * @param error - Supply failure reason.
   *
   * @returns Failure indicator
   */
  static faultily(this: void, error?: unknown): SupplyIsOff.Faultily {
    return isSupplyIsOff(error) && error.failed
        ? error as SupplyIsOff.Faultily
        : new SupplyIsOff({
          failed: true,
          error,
        }) as SupplyIsOff.Faultily;

  }

  readonly #failed: boolean;
  readonly #error: unknown | undefined;
  readonly #result: TResult | undefined;
  readonly #whenOff: number;

  /**
   * Constructs an indicator.
   *
   * @param init - Initialization parameters. Successful supply completion indicator
   */
  constructor(
      ...init: undefined extends TResult
          ? [init?: SupplyIsOff.Init<TResult>]
          : [init: SupplyIsOff.Init<TResult>]
  );

  /**
   * Constructs an indicator derived from the `base` one.
   *
   * Constructed indicator will indicate cut off happened {@link sameTimeAs at the same time} as the `base` one.
   *
   * @param base - Base indicator to derive from.
   * @param init - Initialization parameters overriding corresponding values from the `base` indicator.
   */
  constructor(base: SupplyIsOff<TResult>, init: SupplyIsOff.AnyInit<TResult>);

  constructor(
      initOrBase?: SupplyIsOff<TResult> | SupplyIsOff.Init<TResult>,
      optionalInit?: SupplyIsOff.AnyInit<TResult>,
  ) {
    if (!initOrBase) {
      this.#failed = false;
      this.#whenOff = ++SupplyIsOff$rev;
    } else {

      let base: SupplyIsOff<TResult> | undefined;
      let init: SupplyIsOff.AnyInit<TResult>;

      if (optionalInit) {
        base = initOrBase as SupplyIsOff<TResult>;
        init = optionalInit;
        this.#whenOff = base.#whenOff;
      } else {
        init = initOrBase as SupplyIsOff.Init<TResult>;
        this.#whenOff = ++SupplyIsOff$rev;
      }

      const {
        error,
        result,
        failed = error !== undefined
            ? true
            : result !== undefined
                ? false
                : (base?.failed || false),
      } = init;

      this.#failed = failed;
      this.#error = failed
          ? error !== undefined
              ? error
              : base?.error
          : undefined;
      this.#result = failed
          ? undefined
          : result !== undefined
              ? result
              : base?.result;
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
   * Contains value only when {@link failed} flag is `true`. Contains `undefined` value otherwise.
   */
  get error(): unknown | undefined {
    return this.#error;
  }

  /**
   * A result of successfully completed supply.
   *
   * Contains value only when {@link failed} flag is `false`. Contains `undefined` otherwise.
   */
  get result(): TResult | undefined {
    return this.#result;
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
  sameTimeAs(another: SupplyIsOff<unknown>): boolean {
    return another.#whenOff === this.#whenOff;
  }

  toString(): string {
    if (this.failed) {
      if (this.error === undefined) {
        return `SupplyIsOff.Faultily#${this.#whenOff}`;
      }

      return `SupplyIsOff.Faultily#${this.#whenOff}(error: ${this.error})`;
    }

    if (this.result === undefined) {
      return `SupplyIsOff.Successfully#${this.#whenOff}`;
    }

    return `SupplyIsOff.Successfully#${this.#whenOff}(result: ${this.result})`;
  }

}

function isSupplyIsOff<TResult>(reason: unknown): reason is SupplyIsOff<TResult> {
  return typeof reason === 'object' && !!reason && (reason as Partial<SupplyIsOff>).isOff === reason;
}

export namespace SupplyIsOff {

  /**
   * Initialization parameters of supply cut off {@link SupplyIsOff indicator}.
   *
   * Provides either success of failure indication.
   *
   * @typeParam TResult - Supply result type.
   */
  export type Init<TResult = void> = undefined extends TResult
      ? FailureInit | ErrorInit | SuccessInit | ResultInit<TResult>
      : FailureInit | ErrorInit | ResultInit<TResult>;

  /**
   * Initialization parameters of arbitrary supply cut off {@link SupplyIsOff indicator}.
   *
   * @typeParam TResult - Supply result type.
   */
  export interface AnyInit<out TResult = void> {

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

    /**
     * A result of successfully completed supply.
     *
     * Ignored when {@link failed} flag set to `false`, or {@link error} is present.
     */
    readonly result?: TResult | undefined;

  }

  /**
   * Initialization parameters of failed supply cut off {@link SupplyIsOff indicator} with or without error.
   */
  export interface FailureInit extends AnyInit {

    /**
     * Either `true` or `undefined`, which means the supply failed.
     */
    readonly failed: true;

    /**
     * An error indicating supply failure reason.
     */
    readonly error?: unknown;

    /**
     * Always ignored.
     */
    readonly result?: undefined;

  }

  /**
   * Initialization parameters of failed supply cut off {@link SupplyIsOff indicator} with error.
   */
  export interface ErrorInit extends AnyInit {

    /**
     * Either `true` or `undefined`, which means the supply failed.
     */
    readonly failed?: true | undefined;

    /**
     * An error indicating supply failure reason.
     */
    readonly error: unknown;

    /**
     * Always ignored.
     */
    readonly result?: undefined;

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

    /**
     *  A result of successfully completed supply.
     */
    readonly result?: undefined;

  }

  /**
   * Initialization parameters of successful supply cut off {@link SupplyIsOff indicator}.
   *
   * @typeParam TResult - Supply result type.
   */
  export interface ResultInit<out TResult = void> extends AnyInit<TResult> {

    /**
     * Always `false`, which means the supply succeed.
     */
    readonly failed?: false | undefined;

    /**
     * Always ignored.
     */
    readonly error?: undefined;

    /**
     *  A result of successfully completed supply.
     */
    readonly result: TResult;

  }

  /**
   * An indicator of failed supply {@link Supply.isOff cut off}.
   */
  export interface Faultily extends SupplyIsOff<never> {

    get failed(): true;

    get error(): unknown;

    get result(): undefined;

  }

  /**
   * An indicator of successful supply {@link Supply.isOff cut off}.
   *
   * @typeParam TResult - Supply result type.
   */
  export interface Successfully<out TResult = void> extends SupplyIsOff<TResult> {

    get failed(): false;

    get error(): undefined;

    get result(): TResult;

  }

  export type Reason<TResult, TReason> = TReason extends SupplyIsOff<TResult>
      ? TReason
      : TReason extends SupplyIsOff<unknown>
          ? never
          : TReason;

  export type ReasonArgs<TResult, TReason> = undefined extends TResult
      ? [reason?: Reason<TResult, TReason>]
      : [reason: Reason<TResult, TReason>];

}
