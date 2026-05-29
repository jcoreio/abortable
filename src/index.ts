export const newAbortError = () =>
  new DOMException('This operation was aborted', 'AbortError')

export class AbortError extends Error {
  name = 'AbortError'

  constructor(cause: any) {
    super(
      cause instanceof Error ? cause.message : 'This operation was aborted',
      { cause }
    )
  }
}

const noop = () => {}

export async function abortable<T>(
  promise: Promise<T>,
  signal: AbortSignal | undefined
): Promise<T> {
  if (!signal) return await promise
  if (signal.aborted) {
    // prevent unhandled rejection
    promise.catch(() => {})
    throw new AbortError(signal.reason)
  }
  try {
    return await new Promise<T>((resolve, reject) => {
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
      const onAbort = () => cleanup().reject(signal.reason)

      promise.then(
        (value) => cleanup().resolve(value),
        (error: unknown) => cleanup().reject(error)
      )
      signal.addEventListener('abort', onAbort)
    })
  } catch (error) {
    if (error === undefined || error === signal.reason) {
      throw new AbortError(error)
    }
    throw error
  }
}
