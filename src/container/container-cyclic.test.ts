import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container'

describe('container cyclic dependencies', () => {
  it('detects direct cyclic dependencies', () => {
    const container = createContainer<{
      a: string
      b: string
    }>()

    container.register({
      a: [({ b }) => `A depends on ${b}`],
      b: [({ a }) => `B depends on ${a}`],
    })

    assert.throws(() => container.resolve('a'), {
      message: 'Cyclic dependency detected: a -> b -> a',
    })
  })

  it('detects indirect cyclic dependencies', () => {
    const container = createContainer<{
      a: string
      b: string
      c: string
    }>()

    container.register({
      a: [({ b }) => `A depends on ${b}`],
      b: [({ c }) => `B depends on ${c}`],
      c: [({ a }) => `C depends on ${a}`],
    })

    assert.throws(() => container.resolve('a'), {
      message: 'Cyclic dependency detected: a -> b -> c -> a',
    })
  })

  it('detects cyclic dependencies across scopes', () => {
    const container = createContainer<{
      a: string
    }>()

    container.register({
      a: [({ b }) => `A depends on ${b}`],
    })

    const scope = container.createScope<{
      b: string
    }>()

    scope.register({
      b: [({ a }) => `B depends on ${a}`],
    })

    assert.throws(() => scope.resolve('b'), {
      message: 'Cyclic dependency detected: b -> a -> b',
    })
  })
})
