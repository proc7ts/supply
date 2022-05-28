import { SupplyTarget } from '../supply-target.js';
import { SupplyState } from './supply-state.js';
import { SupplyState$On } from './supply-state.on.js';

export class SupplyState$Nt extends SupplyState$On {

  readonly #targets: SupplyTarget[];

  constructor(target: SupplyTarget) {
    super();
    this.#targets = [target];
  }

  override to(_update: (state: SupplyState) => void, target: SupplyTarget): void {
    this.#compact();
    this.#targets.push(target);
  }

  #compact(): void {

    const length = this.#targets.length;
    let i = length;

    while (--i >= 0 && this.#targets[i].isOff) {/**/}

    const newLength = i + 1;

    if (newLength < length) {
      this.#targets.length = newLength;
    }
  }

  protected override _off(reason: unknown): void {
    for (const target of this.#targets) {
      if (!target.isOff) {
        target.off(reason);
      }
    }
  }

}
