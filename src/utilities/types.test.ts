import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isClass, isFunction } from './types'

describe('isClass', () => {
  it('returns true for classes', () => {
    assert.strictEqual(isClass(class Hello {}), true)
    assert.strictEqual(isClass(class {}), true)
  })

  it('returns false otherwise', () => {
    assert.strictEqual(isClass('hello'), false)
    assert.strictEqual(isClass(123), false)
  })
})

describe('isFunction', () => {
  it('returns true for functions', () => {
    assert.strictEqual(
      // biome-ignore lint/suspicious/noEmptyBlockStatements: needed for testing
      isFunction(function hello() {}),
      true,
    )
    assert.strictEqual(
      // biome-ignore lint/suspicious/noEmptyBlockStatements: needed for testing
      isFunction(() => {}),
      true,
    )
    assert.strictEqual(isFunction(class {}), true)
  })

  it('returns false otherwise', () => {
    assert.strictEqual(isFunction(true), false)
    assert.strictEqual(isFunction(false), false)
    assert.strictEqual(isFunction(''), false)
    assert.strictEqual(isFunction('string'), false)
    assert.strictEqual(isFunction(123), false)
  })
})
