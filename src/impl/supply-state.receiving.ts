import { SupplyIsOff } from '../supply-is-off.js';
import { SupplyReceiver } from '../supply-receiver.js';
import { SupplyState } from './supply-state.js';
import { SupplyState$On } from './supply-state.on.js';

export class SupplyState$Receiving<out TResult> extends SupplyState$On<TResult> {

  readonly #receivers: SupplyReceiver<TResult>[];

  constructor(receiver: SupplyReceiver<TResult>) {
    super();
    this.#receivers = [receiver];
  }

  override alsoOff(_update: (state: SupplyState<TResult>) => void, receiver: SupplyReceiver<TResult>): void {
    this.#compact();
    this.#receivers.push(receiver);
  }

  #compact(): void {

    const length = this.#receivers.length;
    let i = length;

    while (--i >= 0 && this.#receivers[i].isOff) {/**/}

    const newLength = i + 1;

    if (newLength < length) {
      this.#receivers.length = newLength;
    }
  }

  protected override _off(reason: SupplyIsOff<TResult>): boolean {

    let received = false;

    for (const receiver of this.#receivers) {

      const { isOff } = receiver;

      if (!isOff) {
        received = true;
        receiver.cutOff(reason);
      } else if (reason.sameTimeAs(isOff)) {
        received = true;
      }
    }

    return received;
  }

}
