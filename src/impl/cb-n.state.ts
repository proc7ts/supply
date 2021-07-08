import type { Supply } from '../supply';
import { SupplyState$On } from './on.state';

export class SupplyState$CbN extends SupplyState$On {

  constructor(private readonly cbs: ((this: void, reason?: unknown) => void)[]) {
    super();
  }

  whenOff(_supply: Supply, callback: (reason?: unknown) => void): void {
    this.cbs.push(callback);
  }

  protected override cb(reason: unknown): void {
    for (const cb of this.cbs) {
      cb(reason);
    }
  }

}
