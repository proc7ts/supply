/**
 * An error indicating the supply abort reason when no particular abort reason specified.
 */
export class SupplyAbortError extends Error {

  /**
   * Extracts an abort reason of the given `signal`.
   *
   * @param signal - Source abort signal.
   *
   * @returns An abort reason when present, new {@link SupplyAbortError} instance when the one is absent, or `undefined`
   * if the source `signal` is not aborted.
   */
  static reasonOf(signal: AbortSignal): unknown | undefined {
    if (!signal.aborted) {
      return;
    }

    const reason: unknown = signal.reason;

    if (reason == null || (reason as object).constructor.name === 'DOMException') {
      return new SupplyAbortError();
    }

    return reason;
  }

  constructor(message = 'Supply aborted', options?: ErrorOptions) {
    super(message, options);
  }

  override get name(): string {
    return 'SupplyAbortError';
  }

}
