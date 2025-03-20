export type PromiseWithResolvers<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

/**
 * Userland implementation of [Promise.withResolvers]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers}.
 * Once we upgrade to Node 22, we can switch to the builtin.
 */
export function withResolvers<T>(): PromiseWithResolvers<T>
export function withResolvers<T>(
  // typescript-eslint is buggy here
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  this: PromiseConstructor
): PromiseWithResolvers<T>
export function withResolvers<T>(
  this: PromiseConstructor | undefined
): PromiseWithResolvers<T> {
  const PromiseConstructor = this || Promise
  let resolve, reject
  const promise = new PromiseConstructor<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resolve || !reject) {
    throw new Error(
      'resolve or reject was undefined here, this should never happen'
    )
  }
  return { promise, resolve, reject }
}
