import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { asFunction } from './function'

describe('asFunction', () => {
  const testFunction = (cradle: number) => ({ value: cradle })

  it('creates a resolver with a resolve method', () => {
    const resolver = asFunction(testFunction)
    assert.strictEqual(typeof resolver.resolve, 'function')
  })

  it('resolves the function by calling it', () => {
    const resolver = asFunction(testFunction)
    const cradle = 42
    // @ts-expect-error
    const result = resolver.resolve(cradle)
    assert.deepStrictEqual(result, { value: 42 })
  })

  it('throws an error when given a non-function', () => {
    // @ts-expect-error
    assert.throws(() => asFunction({}))
  })

  it('sets the default lifetime to transient', () => {
    const resolver = asFunction(testFunction)
    assert.strictEqual(resolver.lifetime, 'transient')
  })

  it('allows overriding the lifetime', () => {
    const resolver = asFunction(testFunction, { lifetime: 'singleton' })
    assert.strictEqual(resolver.lifetime, 'singleton')
  })

  it('allows setting isLeakSafe option', () => {
    const resolver = asFunction(testFunction, { isLeakSafe: true })
    assert.strictEqual(resolver.isLeakSafe, true)
  })
})
