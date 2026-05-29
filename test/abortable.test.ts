import { describe, it } from 'mocha'
import { abortable, newAbortError, AbortError } from '../src/index'
import { expect } from 'chai'
import { withResolvers } from './withResolvers'
import { tried } from './tried'

describe(`abortable`, function () {
  it(`resolves to promise if signal is undefined`, async function () {
    const promise = Promise.resolve(42)
    expect(await abortable(promise, undefined)).to.equal(42)
  })
  it(`resolves if promise resolves first`, async function () {
    const ac = new AbortController()
    expect(await abortable(Promise.resolve(42), ac.signal)).to.equal(42)
    ac.abort()
  })
  it(`rejects if promise rejects first`, async function () {
    const ac = new AbortController()
    await expect(abortable(Promise.reject(new Error('test')), ac.signal))
      .to.be.rejectedWith(Error)
      .that.eventually.deep.equals(new Error('test'))
    ac.abort()
  })
  it(`rejects if signal is already aborted`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    ac.abort()
    const [, error] = tried(() => ac.signal.throwIfAborted())()
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(AbortError)
        .that.eventually.deep.equals(new AbortError(error)),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      p.resolve(42),
    ])
  })
  it(`bug - unhandled rejection when signal is aborted`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    ac.abort()
    const [, error] = tried(() => ac.signal.throwIfAborted())()
    p.reject(new Error('test')) // this is intentionally uncaught,
    // we're testing that abortable catches any rejection even if the signal is
    // already aborted
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(AbortError)
        .that.eventually.deep.equals(new AbortError(error)),
    ])
  })
  it(`rejects if signal aborts before promise resolves`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(AbortError)
        .that.eventually.deep.equals(
          new AbortError(tried(() => ac.signal.throwIfAborted())()[1])
        ),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      ac.abort(),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      p.resolve(42),
    ])
  })
  it(`rejects if signal aborts before promise rejects`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(AbortError)
        .that.eventually.deep.equals(
          new AbortError(tried(() => ac.signal.throwIfAborted())()[1])
        ),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      ac.abort(),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      p.reject(new Error('test')),
    ])
  })
  it(`rejection error has both stack traces`, async function () {
    async function makePromise(signal: AbortSignal) {
      const p = withResolvers<number>()
      return await abortable(p.promise, signal)
    }

    const ac = new AbortController()
    await Promise.all([
      makePromise(ac.signal).catch((error: unknown) => {
        if (!(error instanceof AbortError)) {
          throw new Error('expected error to be an AbortError')
        }
        expect(error).to.be.instanceOf(AbortError)
        expect(error.stack).to.include('makePromise')
        expect(error.cause).to.be.instanceOf(DOMException)
      }),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      ac.abort(),
    ])
  })
})
it('newAbortError works', function () {
  expect(newAbortError()).to.be.an.instanceOf(DOMException)
  expect(newAbortError().name).to.equal('AbortError')
  expect(newAbortError().message).to.equal('This operation was aborted')
})
