import { SupplyTarget } from '../supply-target.js';
import { SupplyState } from './supply-state.js';
import { SupplyState$On } from './supply-state.on.js';

export class SupplyState$1t extends SupplyState$On {

  #target: SupplyTarget;

  constructor(target: SupplyTarget) {
    super();
    this.#target = target;
  }

  override off(update: (state: SupplyState) => void, reason?: unknown): void {
    super.off(update, reason);
  }

  override to(update: (state: SupplyState) => void, target: SupplyTarget): void {
    if (this.#target.isOff) {
      this.#target = target;
    } else {
      update(new SupplyState$Nt([this.#target, target]));
    }
  }

  protected override _off(reason: unknown): void {
    if (!this.#target.isOff) {
      this.#target.off(reason);
    }
  }

}

export class SupplyState$Nt extends SupplyState$On {

  readonly #targets: SupplyTarget[];

  constructor(targets: SupplyTarget[]) {
    super();
    this.#targets = targets;
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
