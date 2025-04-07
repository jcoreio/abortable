export type PromiseWithResolvers<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

/**
 * Userland implementation of [Promise.withResolvers]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers}.
 * Once we upgrade to Node 22, we can switch to the builtin.
 */
export function withResolvers<T>(): PromiseWithResolvers<T> {
  let resolve: ((value: T | PromiseLike<T>) => void) | undefined,
    reject: ((reason?: any) => void) | undefined
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  if (!resolve || !reject) {
    throw new Error(
      'resolve or reject was undefined here, this should never happen'
    )
  }
  return { promise, resolve, reject }
}
