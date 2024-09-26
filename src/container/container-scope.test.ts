import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container'

describe('container scope feature', () => {
  it('creates a new scope with access to parent registrations', () => {
    const container = createContainer<{
      parentValue: string
    }>()

    container.register({
      parentValue: [() => 'parent'],
    })

    const scope = container.createScope<{
      scopedValue: string
    }>()

    scope.register({
      scopedValue: [() => 'scoped'],
    })

    assert.strictEqual(scope.resolve('parentValue'), 'parent')
    assert.strictEqual(scope.resolve('scopedValue'), 'scoped')
  })

  it('allows overriding parent registrations in scope', () => {
    const container = createContainer<{
      value: string
    }>()

    container.register({
      value: [() => 'parent'],
    })

    const scope = container.createScope()

    scope.register({
      value: [() => 'scoped'],
    })

    assert.strictEqual(container.resolve('value'), 'parent')
    assert.strictEqual(scope.resolve('value'), 'scoped')
  })

  it('maintains separate resolution caches for singletons', () => {
    const container = createContainer<{
      singletonValue: number
    }>()
    let counter = 0

    container.register({
      singletonValue: [() => ++counter, { strategy: 'singleton' }],
    })

    const scope = container.createScope()

    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(container.resolve('singletonValue'), 1)
    assert.strictEqual(scope.resolve('singletonValue'), 2)
    assert.strictEqual(scope.resolve('singletonValue'), 2)
  })

  it('allows nested scopes', () => {
    const container = createContainer<{
      value: string
    }>()

    container.register({
      value: [() => 'root'],
    })

    const scope1 = container.createScope()
    const scope2 = scope1.createScope()

    scope1.register({
      value: [() => 'scope1'],
    })

    assert.strictEqual(container.resolve('value'), 'root')
    assert.strictEqual(scope1.resolve('value'), 'scope1')
    assert.strictEqual(scope2.resolve('value'), 'scope1')

    scope2.register({
      value: [() => 'scope2'],
    })

    assert.strictEqual(scope2.resolve('value'), 'scope2')
  })

  it('isolates registrations between scopes', () => {
    const container = createContainer<{
      rootValue: string
    }>()

    container.register({
      rootValue: [() => 'root'],
    })

    const scope1 = container.createScope<{
      scope1Value: string
    }>()

    const scope2 = container.createScope<{
      scope2Value: string
    }>()

    scope1.register({
      scope1Value: [() => 'scope1'],
    })

    scope2.register({
      scope2Value: [() => 'scope2'],
    })

    assert.strictEqual(scope1.resolve('rootValue'), 'root')
    assert.strictEqual(scope2.resolve('rootValue'), 'root')
    assert.strictEqual(scope1.resolve('scope1Value'), 'scope1')
    assert.strictEqual(scope2.resolve('scope2Value'), 'scope2')

    // @ts-expect-error
    assert.throws(() => scope1.resolve('scope2Value'), {
      message: 'Resolver for scope2Value not found',
    })

    // @ts-expect-error
    assert.throws(() => scope2.resolve('scope1Value'), {
      message: 'Resolver for scope1Value not found',
    })
  })
})
