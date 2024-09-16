import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { asClass } from './class'

describe('asClass', () => {
  class TestClass {
    // biome-ignore lint/style/noParameterProperties: needed for testing
    constructor(public value: number) {}
  }

  it('creates a resolver with a resolve method', () => {
    const resolver = asClass(TestClass)
    assert.strictEqual(typeof resolver.resolve, 'function')
  })

  it('resolves the class by instantiating it', () => {
    const resolver = asClass(TestClass)
    const cradle = 42
    // @ts-expect-error
    const result = resolver.resolve(cradle)
    assert.ok(result instanceof TestClass)
    assert.strictEqual(result.value, 42)
  })

  it('throws an error when given a non-function', () => {
    // @ts-expect-error
    assert.throws(() => asClass({}))
  })

  it('sets the default lifetime to transient', () => {
    const resolver = asClass(TestClass)
    assert.strictEqual(resolver.lifetime, 'transient')
  })

  it('allows overriding the lifetime', () => {
    const resolver = asClass(TestClass, { lifetime: 'singleton' })
    assert.strictEqual(resolver.lifetime, 'singleton')
  })

  it('allows setting isLeakSafe option', () => {
    const resolver = asClass(TestClass, { isLeakSafe: true })
    assert.strictEqual(resolver.isLeakSafe, true)
  })
})
