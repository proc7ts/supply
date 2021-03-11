/**
 * @internal
 */
export let Supply$unexpectedAbort: (reason: unknown) => void = Supply$unexpectedAbort$byDefault;

/**
 * @internal
 */
export function Supply$unexpectedAbort$handle(handler = Supply$unexpectedAbort$byDefault): void {
  Supply$unexpectedAbort = handler;
}

function Supply$unexpectedAbort$byDefault(reason: unknown): void {
  console.error('Supply aborted unexpectedly', reason);
}
