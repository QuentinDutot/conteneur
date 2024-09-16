import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { asValue } from './value'

describe('asValue', () => {
  const testValue = 42

  it('creates a resolver with a resolve method', () => {
    const resolver = asValue(testValue)
    assert.strictEqual(typeof resolver.resolve, 'function')
  })

  it('resolves to the original value', () => {
    const resolver = asValue(testValue)
    const result = resolver.resolve({})
    assert.strictEqual(result, testValue)
  })

  it('works with different types of values', () => {
    const stringResolver = asValue('test')
    assert.strictEqual(stringResolver.resolve({}), 'test')

    const objectResolver = asValue({ key: 'value' })
    assert.deepStrictEqual(objectResolver.resolve({}), { key: 'value' })

    const arrayResolver = asValue([1, 2, 3])
    assert.deepStrictEqual(arrayResolver.resolve({}), [1, 2, 3])
  })

  it('sets isLeakSafe to true', () => {
    const resolver = asValue(testValue)
    assert.strictEqual(resolver.isLeakSafe, true)
  })

  it('does not have a lifetime property', () => {
    const resolver = asValue(testValue)
    assert.strictEqual('lifetime' in resolver, false)
  })
})
