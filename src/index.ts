export const newAbortError = () =>
  new DOMException('This operation was aborted', 'AbortError')

const noop = () => {}

export function abortable<T>(
  promise: Promise<T>,
  signal: AbortSignal | undefined
): Promise<T> {
  if (!signal) return promise
  return new Promise<T>((resolve, reject) => {
    const cleanup = () => {
      const callbacks = { resolve, reject }
      // Prevent memory leaks.  If the input promise never resolves, then the handlers
      // below would retain this enclosing Promise's resolve and reject callbacks,
      // which would retain the enclosing Promise and anything waiting on it.
      // By replacing references to these callbacks, we enable the enclosing Promise to
      // be garbage collected
      resolve = noop
      reject = noop
      // Memory could also leak if the signal never aborts, unless we remove the abort
      // handler
      signal.removeEventListener('abort', onAbort)
      return callbacks
    }
    const onAbort = () => cleanup().reject(newAbortError())

    promise.then(
      (value) => cleanup().resolve(value),
      (error) => cleanup().reject(error)
    )
    if (signal.aborted) {
      reject(newAbortError())
    } else {
      signal.addEventListener('abort', onAbort)
    }
  })
}
