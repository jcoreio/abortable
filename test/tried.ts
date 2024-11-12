type Tried<T> = [T | undefined, any]

/**
 * Helper for getting the result or error of an operation inline, inspired
 * by proposed JS try expressions
 *
 * Examples:
 *
 * Sync function:
 *   const [result, error] = tried((x) => x * 2)(21) // [42, undefined]
 *   const [result, error] = tried(() => { throw new Error('test') })() // [undefined, new Error('test)]
 *
 * Async function:
 *   const [result, error] = await tried(async (x) => x * 2)(21) // [42, undefined]
 *   const [result, error] = await tried(async () => { throw new Error('test') })() // [undefined, new Error('test)]
 *
 * Promise:
 *   const [result, error] = await tried(Promise.resolve(42)) // [42, undefined]
 *   const [result, error] = await tried(Promise.reject(new Error('test'))) // [undefined, new Error('test')]
 */
export function tried<Args extends any[], T>(
  fn: (...args: Args) => T
): (...args: Args) => Tried<T>
export function tried<Args extends any[], T>(
  fn: (...args: Args) => PromiseLike<T>
): (...args: Args) => Promise<Tried<T>>
export function tried<T>(promise: PromiseLike<T>): Promise<Tried<T>>
export function tried<Args extends any[], T>(
  x: PromiseLike<T> | ((...args: Args) => T | PromiseLike<T>)
): ((...args: Args) => Tried<T> | Promise<Tried<T>>) | Promise<Tried<T>> {
  if (isPromiseLike<T>(x)) {
    return (x as Promise<T>).then(
      (value) => [value, undefined],
      (reason) => [undefined, reason]
    )
  }
  return (...args: Args) => {
    if (typeof x !== 'function') {
      return [
        undefined,
        new Error('invalid input, must be a function or a Promise'),
      ] as const
    }
    try {
      const result = x(...args)
      return isPromiseLike<T>(result) ? tried(result) : [result, undefined]
    } catch (error) {
      return [undefined, error]
    }
  }
}

function isPromiseLike<T>(x: any): x is PromiseLike<T> {
  return typeof x?.then === 'function'
}
