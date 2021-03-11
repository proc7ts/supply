The Supply Of Something
=======================

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][API documentation]

The `Supply` class represents a supply of something. E.g. some subscription.

When the supply is no longer needed, it can be cut off. Cutting off the supply informs the interested parties. 

[npm-image]: https://img.shields.io/npm/v/@proc7ts/supply.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@proc7ts/supply
[build-status-img]: https://github.com/proc7ts/supply/workflows/Build/badge.svg
[build-status-link]: https://github.com/proc7ts/supply/actions?query=workflow%3ABuild
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/proc7ts/supply
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[API documentation]: https://proc7ts.github.io/supply/ 


Example
=======

The supply may represent the of registration of event listener:

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

// Register a button click listener.
const supply = registerListener(
    document.getElementById('button'),
    'click',
    event => console.debug('Button clicked', event),
);

// ...now listening for clicks...

// Unregister event listener.
supply.off();
```

`Supply`
========

A `Supply` is a class. Its constructor accepts optional callback instance. The latter will be called once the supply
is cut off.

### `off(reason?: unknown)`

[off()]: #offreason-unknown
[cut off]: #offreason-unknown

Calling this method cuts off the supply.

Accepts an optional reason. By convention `undefined` or absent reason means the supply is completed normally.
Everything else means the supply is aborted abnormally because of this reason.

When called, all registered cut off callbacks are called with the given reason and [isOff] property value becomes `true`.


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


### `needs(other: SupplyPeer)`

Makes the supply depend on another one.

Once `another` supply is [cut off], this one will be cut off with the same reason.


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
