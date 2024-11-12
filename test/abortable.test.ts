import { describe, it } from 'mocha'
import { abortable } from '../src/index'
import { expect } from 'chai'
import { withResolvers } from './withResolvers'
import { tried } from './tried'

describe(`abortable`, function () {
  it(`returns promise if signal is undefined`, async function () {
    const promise = Promise.resolve(42)
    expect(abortable(promise, undefined)).to.equal(promise)
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
        .to.be.rejectedWith(DOMException)
        .that.eventually.deep.equals(error),
      p.resolve(42),
    ])
  })
  it(`rejects if signal aborts before promise resolves`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(DOMException)
        .that.eventually.deep.equals(
          new DOMException('This operation was aborted', 'AbortError')
        ),
      ac.abort(),
      p.resolve(42),
    ])
  })
  it(`rejects if signal aborts before promise rejects`, async function () {
    const p = withResolvers<number>()
    const ac = new AbortController()
    await Promise.all([
      expect(abortable(p.promise, ac.signal))
        .to.be.rejectedWith(DOMException)
        .that.eventually.deep.equals(
          new DOMException('This operation was aborted', 'AbortError')
        ),
      ac.abort(),
      p.reject(new Error('test')),
    ])
  })
})
