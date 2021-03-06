The Supply Of Something
=======================

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][API documentation]

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
[API documentation]: https://proc7ts.github.io/supply/ 


Example
=======

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
const supply = registerListener(
    document.getElementById('button'),
    'click',
    event => console.debug('Button clicked', event),
).whenOff(reason => {
  // Additional callback to call when the listener removed.
  console.debug('No longer handling clicks', reason);
});

// ...now listening for clicks...

// Remove the listener.
supply.off();
```

`Supply`
========

A `Supply` is a class. Its constructor accepts optional callback instance. The latter will be called once the supply
cut off.

### `off(reason?: unknown)`

[off()]: #offreason-unknown
[cut off]: #offreason-unknown

Calling this method cuts off the supply.

Accepts an optional reason. By convention `undefined` or absent reason means the supply is done successfully.
Everything else means the supply is aborted abnormally because of that reason.

When called, all registered cut off callbacks are called with the given reason and [isOff] property value becomes
`true`.


### `isOff`

[isOff]: #isoff

This is flag indicating whether the supply is cut off.

Equals to `false` initially. Becomes `true` after calling the [off()] method.


### `whenOff(callback: (reason?: unknown) => void)`

Registers a callback function that will be called when the supply is [cut off]. If the supply is cut off already when
calling this method, the callback will be called immediately.

The registered callback receives a cut off reason as its only parameter.

The callback will be called at most once.


### `whenDone()`

Returns a promise that will be resolved once the supply is [cut off].

The returned promise will be successfully resolved once the supply is cut off without a reason, or rejected once the
supply is cut off with any reason except `undefined`.


### `supply`

This property contains the supply itself.

Implementing this property makes the supply implement a `SupplyPeer` interface. Any instance implementing the latter
can be passed to supporting methods like `cuts()`, `needs()`, or `as()`.


### `cuts(other: SupplyPeer)`

Makes another supply depend on this one.

Once the supply is [cut off], `another` one will be cut off with the same reason.

Calling this method has the same effect as calling `another.supply.needs(this)`.


### `derive(derived?: SupplyPeer)`

Creates derived supply depending on this one.

If derived supply peer specified, makes it depend on this one.

In contrast to `.cuts()` method, this one returns derived supply.


### `needs(other: SupplyPeer)`

Makes the supply depend on another one.

Once `another` supply is [cut off], this one will be cut off with the same reason.


### `require(required?: SupplyPeer)`

Creates required supply this one depends on.

If required supply peer specified, makes this one depend on it.

In contrast to `.needs()` method, this one returns required supply.


### `as(another: SupplyPeer)`

Makes this and another supply depend on each other.

Calling this method is the same as calling `.needs(another).cuts(another)`.


`neverSupply()`
===============

Builds a never-supply instance.

Returns a supply instance that is already cut off without any particular reason.
                                                                                

`alwaysSupply()`
================

Builds an always-supply instance.

The `off()` method of the returned supply does nothing.

Returns a supply instance that can not be cut off.


Unexpected Aborts
=================

An unexpected abort happens when any supply is [cut off] with some reason, but there is no cut off callback registered.

By default, an unexpected abort reason is logged to console. This behavior can be changed by assigning another
unexpected abort handler with `Supply.onUnexpectedAbort()` static method.
