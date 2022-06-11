import { SupplyIsOff } from '../supply-is-off.js';

export let Supply$unexpectedFailure: (reason: SupplyIsOff.Faultily) => void = Supply$unexpectedFailure$byDefault;

export function Supply$unexpectedFailure$handle(handler = Supply$unexpectedFailure$byDefault): void {
  Supply$unexpectedFailure = handler;
}

function Supply$unexpectedFailure$byDefault(reason: SupplyIsOff.Faultily): void {
  console.error('Supply aborted unexpectedly.', reason.error);
}
