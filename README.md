# The Supply Of Something

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api documentation]

The `Supply` class represents a supply of something. E.g. some subscription.

When the supply is no longer needed, it can be cut off. Cutting off the supply informs the interested parties.

[npm-image]: https://img.shields.io/npm/v/@proc7ts/supply.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@proc7ts/supply
[build-status-img]: https://github.com/proc7ts/supply/workflows/Build/badge.svg
[build-status-link]: https://github.com/proc7ts/supply/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/694ef3db15234fd68cb6ba5405d421a0
[quality-link]: https://www.codacy.com/gh/proc7ts/supply/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/supply&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/694ef3db15234fd68cb6ba5405d421a0
[coverage-link]: https://www.codacy.com/gh/proc7ts/supply/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/supply&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/proc7ts/supply
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api documentation]: https://proc7ts.github.io/supply/

# Example

The supply may represent the registration of event listener:

```typescript
import { Supply } from '@proc7ts/supply';

/**
 * Registers event listener and returns a supply that unregisters it once cut off.
 */
function registerListener(target: EventTarget, eventType: string, listener: (event: Event) => void): Supply {
  target.addEventListener(eventType, listener);
  return new Supply(() => {
    target.removeEventListener(eventType, listener);
  });
}

// Add a button click listener.
const supply = registerListener(document.getElementById('button'), 'click', event =>
  console.debug('Button clicked', event),
).whenOff(reason => {
  // Additional callback to call when the listener removed.
  console.debug('No longer handling clicks', reason);
});

// ...now listening for clicks...

// Remove the listener.
supply.off();
```

# `Supply`

A `Supply` is a class. Its constructor accepts optional callback instance. The latter will be called once the supply
cut off.

### `cutOff(reason: SuupplyIsOff)`

[cut off]: #cutoffreason-suupplyisoff

Cuts off the supply.

When called for the first time, all registered supply receivers informed with the given `reason`, and [isOff]
property value becomes equal to it. Calling this method for the second time has no effect.

After this method call nothing would be supplied anymore.

### `off(reason?: unknown)`

Cuts off this supply with arbitrary reason.

Calling this method is the same as calling `this.cutOff(SupplyIsOff.becauseOf(reason))`.

Accepts an optional reason why the supply is cut off. This reason converted to supply cut off {@link isOff indicator}.
Everything else means the supply is aborted abnormally because of that reason. By convenience, `undefined` or missing
`reason` means successful supply completion.

### `isOff`

[isoff]: #isoff

Indicates whether this supply is [cut off] already.

`null` initially. Set once supply [cut off]. Once set, nothing will be supplied anymore.

The value returned is an object that indicates why the supply has been cut off (i.e. due to failure or successful
completion), and when this happened.

### `alsoOff(receiver: { isOff: undefined, off: (reason?: unknown) => void })`

[alsooff]: #alsooffreceiver--isoff-undefined-off-reason-unknown--void-

Registers a receiver of the supply.

Once this supply is [cut off], the `receiver` will be [informed][cut off] on that, unless it is unavailable already.

The `receiver` becomes unavailable once its [isOff] flag set to true.

Supply receivers may be used as a passive alternative to `removeEventListener` approach. While the latter can be used
to remove the listener in order to stop receiving events, the supply receiver may set itself unavailable, so that the
supplier would be able to remove it occasionally.

### `whenOff(receiver: (reason?: unknown) => void)`

Registers a supply receiver function that will be called as soon as this supply [cut off].

Calling this method is the same as calling `this.alsoOff(SupplyReceiver(receiver))`

### `whenDone()`

Builds a promise that will be resolved once the supply is [cut off].

The returned promise will be successfully resolved once this supply completes successfully, or rejected with failure
reason.

### `derive(derived?: SupplyReceiver)`

Creates derived supply depending on this one.

If derived supply receiver specified, makes it depend on this one.

In contrast to [alsoOff] method, this one returns derived supply receiver.

### `needs(supplier: Supplier)`

[needs]: #needssupplier-supplier

Makes this supply depend on another supplier.

Once the `supplier` cuts off the supply, this supply will be [cut off] with the same reason.

Calling this method has the same effect as calling `supplier.alsoOff(this)`.

### `require(required?: Supplier)`

Creates required supply this one depends on.

If required supplier specified, makes this one depend on it.

In contrast to [needs] method, this one returns required supply.

### `as(another: SupplyReceiver & Supplier)`

Makes this and another supply depend on each other.

Calling this method is the same as calling `this.needs(another).alsoOff(another)`.

# Predefined Supply Implementations

## `neverSupply()`

Builds a never-supply instance.

Returns a supply instance that is already cut off without any particular reason.

## `alwaysSupply()`

Builds an always-supply instance.

The `cutOff()` method of the returned supply does nothing.

Returns a supply instance that can not be cut off.

## `timedSupply(timeout: number, { createReason: (timeout: number) => unknown })`

Creates a supply, that is automatically cut off after specified `timeout`.

Optional `createReason` function creates a custom reason why the supply cut off after timeout. A timeout error used
as reason when omitted.

# Unexpected Failures

Unexpected failure happens when any supply [cut off] due to some failure, and there is no supply receiver registered
and still available to handle it.

By default, an unexpected abort reason is warned to console. This behavior can be changed by assigning another
unexpected failure handler with `Supply.onUnexpectedFailure()` static method.
