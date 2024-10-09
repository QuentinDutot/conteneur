import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container'

describe('container target type', () => {
  it('resolves function dependencies', () => {
    const createValue = () => 'function result'

    const container = createContainer<{
      value: string
    }>()

    container.register({
      value: [createValue],
    })

    assert.strictEqual(container.resolve('value'), 'function result')
  })

  it('resolves class dependencies', () => {
    class Value {
      print() {
        return 'class result'
      }
    }

    const container = createContainer<{
      value: Value
    }>()

    container.register({
      value: [Value],
    })

    assert.strictEqual(container.resolve('value').print(), 'class result')
  })

  it('injects function dependencies', () => {
    const createValue = () => 'function result'

    const container = createContainer()

    assert.strictEqual(container.inject(createValue), 'function result')
  })

  it('injects class dependencies', () => {
    class Value {
      print() {
        return 'class result'
      }
    }

    const container = createContainer()

    assert.strictEqual(container.inject(Value).print(), 'class result')
  })

  it('throws an error on invalid target injection', () => {
    const container = createContainer()

    // @ts-expect-error
    assert.throws(() => container.inject('not a function or class'), {
      message: 'Injection target must be a function or a class',
    })
  })
})
