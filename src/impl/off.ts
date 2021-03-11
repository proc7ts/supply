import { Supply$unexpectedAbort } from './unexpected-abort';

let Supply$off = false;
let Supply$off$unexpected$reasons: Set<unknown> | undefined;

/**
 * @internal
 */
export function Supply$off$start(): boolean {

  const prevOff = Supply$off;

  Supply$off = true;

  return prevOff;
}

/**
 * @internal
 */
export function Supply$off$unexpected(reason: unknown): void {
  if (!Supply$off$unexpected$reasons) {
    Supply$off$unexpected$reasons = new Set<unknown>();
  }
  Supply$off$unexpected$reasons.add(reason);
}

/**
 * @internal
 */
export function Supply$off$end(prevOff: boolean): void {
  Supply$off = prevOff;
  if (!prevOff) {

    const reasons = Supply$off$unexpected$reasons;

    if (reasons) {
      Supply$off$unexpected$reasons = undefined;
      for (const reason of reasons) {
        Supply$unexpectedAbort(reason);
      }
    }
  }
}
