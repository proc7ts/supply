import { SupplyIsOff } from './supply-is-off.js';
import { Supply } from './supply.js';

/**
 * Creates a supply, that is automatically cut off after specified `timeout`.
 *
 * @typeParam TResult - Supply result type.
 * @param timeout - The maximum time in milliseconds the supply exists for.
 * @param onTimeout - Creates a custom indicator of supply cut off after timeout. A timeout error used as a failure
 * reason when omitted.
 *
 * @returns New timed supply. The timer will be stopped once this supply cut off.
 */
export function timedSupply<TResult = void>(
    timeout: number,
    {
      onTimeout = timedSupply$defaultOnTimeout,
    }: {
      readonly onTimeout?: ((this: void, timeout: number) => SupplyIsOff<TResult>) | undefined;
    } = {},
): Supply<TResult> {
  const supply = new Supply<TResult>();
  const handle = setTimeout(() => supply.cutOff(onTimeout(timeout)), timeout);

  return supply.whenOff(() => clearTimeout(handle));
}

function timedSupply$defaultOnTimeout<TResult>(timeout: number): SupplyIsOff<TResult> {
  return new SupplyIsOff({ error: new Error(`Timed out after ${timeout} ms`) });
}
