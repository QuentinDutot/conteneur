import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container'

describe('container strategy feature', () => {
  it('respects transient strategy', () => {
    const container = createContainer<{
      transientValue: number
    }>()
    let counter = 0

    container.register({
      transientValue: [() => ++counter, { strategy: 'transient' }],
    })

    assert.strictEqual(container.resolve('transientValue'), 1)
    assert.strictEqual(container.resolve('transientValue'), 2)
    assert.strictEqual(container.resolve('transientValue'), 3)
  })

  it('respects singleton strategy', () => {
    const container = createContainer<{
      singletonValue: number
    }>()
    let counter = 0

    container.register({
      singletonValue: [() => ++counter, { strategy: 'singleton' }],
    })

    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(container.resolve('singletonValue'), 1)
  })

  it('uses default strategy when not specified', () => {
    const container = createContainer<{
      defaultValue: number
    }>({ defaultStrategy: 'singleton' })
    let counter = 0

    container.register({
      defaultValue: [() => ++counter],
    })

    assert.strictEqual(container.resolve('defaultValue'), 1)
    assert.strictEqual(container.resolve('defaultValue'), 1)
    assert.strictEqual(container.resolve('defaultValue'), 1)
  })

  it('allows mixing strategies', () => {
    const container = createContainer<{
      transientValue: number
      singletonValue: number
    }>()
    let transientCounter = 0
    let singletonCounter = 0

    container.register({
      transientValue: [() => ++transientCounter, { strategy: 'transient' }],
      singletonValue: [() => ++singletonCounter, { strategy: 'singleton' }],
    })

    assert.strictEqual(container.resolve('transientValue'), 1)
    assert.strictEqual(container.resolve('transientValue'), 2)
    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(container.resolve('transientValue'), 3)
  })
})
