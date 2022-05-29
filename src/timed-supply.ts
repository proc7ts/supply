import { Supply } from './supply.js';

/**
 * Creates a supply, that is automatically cut off after specified `timeout`.
 *
 * @param timeout - The maximum time in milliseconds the supply exists for.
 * @param createReason - Creates a custom reason why the supply cut off after timeout. A timeout error used as reason
 * when omitted.
 *
 * @returns New timed supply.
 */
export function timedSupply(
    timeout: number,
    {
      createReason = timedSupply$defaultReason,
    }: {
      readonly createReason?: ((this: void, timeout: number) => unknown) | undefined;
    } = {},
): Supply {
  const supply = new Supply();
  const handle = setTimeout(() => supply.off(createReason(timeout)), timeout);

  return supply.whenOff(() => clearTimeout(handle));
}

function timedSupply$defaultReason(timeout: number): Error {
  return new Error(`Timed out after ${timeout} ms`);
}
