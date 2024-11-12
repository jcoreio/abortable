# @jcoreio/abortable

memory-leak-proof function to wrap a promise to reject when a signal is aborted

[![CircleCI](https://circleci.com/gh/jcoreio/abortable.svg?style=svg)](https://circleci.com/gh/jcoreio/abortable)
[![Coverage Status](https://codecov.io/gh/jcoreio/abortable/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/abortable)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/%40jcoreio%2Fabortable.svg)](https://badge.fury.io/js/%40jcoreio%2Fabortable)

## `abortable(promise, signal)`

Creates a promise that fulfills when the given `promise` fulfills, or rejects when the given `signal` is aborted,
whichever comes first. If the signal is aborted, rejects with a `DOMException` with `name: 'AbortError'`.

Once the returned promise resolves or rejects, references to all promise and signal handlers will have been removed,
so that it doesn't unexpectedly retain any memory.

```ts
import { abortable } from '@jcoreio/abortable'

const abortController = new AbortContorller()
const { signal } = abortController

const promise = abortable(new Promise((r) => setTimeout(r, 10000)), signal)
```
