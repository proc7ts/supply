import { SupplyReceiver } from '../supply-receiver.js';
import { SupplyState } from './supply-state.js';
import { SupplyState$On } from './supply-state.on.js';

export class SupplyState$WithReceivers extends SupplyState$On {

  readonly #receivers: SupplyReceiver[];

  constructor(receiver: SupplyReceiver) {
    super();
    this.#receivers = [receiver];
  }

  override to(_update: (state: SupplyState) => void, receiver: SupplyReceiver): void {
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

  protected override _off(reason: unknown): void {
    for (const receiver of this.#receivers) {
      if (!receiver.isOff) {
        receiver.off(reason);
      }
    }
  }

}
