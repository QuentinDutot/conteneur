import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isLifetimeLonger } from './lifetime'

describe('isLifetimeLonger', () => {
  it('compares lifetimes correctly', () => {
    assert.strictEqual(isLifetimeLonger('transient', 'transient'), false)
    assert.strictEqual(isLifetimeLonger('transient', 'scoped'), false)
    assert.strictEqual(isLifetimeLonger('transient', 'singleton'), false)
    assert.strictEqual(isLifetimeLonger('scoped', 'transient'), true)
    assert.strictEqual(isLifetimeLonger('scoped', 'scoped'), false)
    assert.strictEqual(isLifetimeLonger('scoped', 'singleton'), false)
    assert.strictEqual(isLifetimeLonger('singleton', 'transient'), true)
    assert.strictEqual(isLifetimeLonger('singleton', 'scoped'), true)
    assert.strictEqual(isLifetimeLonger('singleton', 'singleton'), false)
  })
})
