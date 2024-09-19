import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container'

describe('container', () => {
  it('returns an object with methods', () => {
    const container = createContainer()
    assert.strictEqual(typeof container, 'object')
    assert.strictEqual(typeof container.register, 'function')
    assert.strictEqual(typeof container.resolve, 'function')
    assert.strictEqual(typeof container.inject, 'function')
    assert.strictEqual(typeof container.createScope, 'function')
  })

  it('resolves plain dependencies', () => {
    const container = createContainer<{
      string: string
      number: number
      object: { string: string; number: number }
    }>()

    container.register({
      string: [() => 'plain string'],
      number: [() => 42],
      object: [({ string, number }) => ({ string, number })],
    })

    assert.strictEqual(container.resolve('string'), 'plain string')
    assert.strictEqual(container.resolve('number'), 42)
    assert.deepStrictEqual(container.resolve('object'), { string: 'plain string', number: 42 })
  })

  it('resolves nested dependencies', () => {
    const container = createContainer<{
      config: { apiUrl: string }
      api: { fetch: () => string }
    }>()

    container.register({
      config: [() => ({ apiUrl: 'https://api.example.com' })],
      api: [
        ({ config }) => ({
          fetch: () => `Fetching from ${config.apiUrl}`,
        }),
      ],
    })

    const result = container.resolve('api').fetch()
    assert.strictEqual(result, 'Fetching from https://api.example.com')
  })

  it('injects unregistered dependencies', () => {
    const container = createContainer<{
      greeting: string
      name: string
    }>()

    container.register({
      greeting: [() => 'Hello'],
      name: [() => 'World'],
    })

    const result = container.inject(({ greeting, name }) => `${greeting}, ${name}!`)
    assert.strictEqual(result, 'Hello, World!')
  })

  it('resolves dependencies lazily', () => {
    const container = createContainer<{
      count: number
    }>()
    let counter = 0

    container.register({
      count: [
        () => {
          counter++
          return counter
        },
      ],
    })

    assert.strictEqual(counter, 0) // Not resolved yet
    assert.strictEqual(container.resolve('count'), 1)
    assert.strictEqual(container.resolve('count'), 2)
    assert.strictEqual(counter, 2) // Resolved twice
  })

  it('allows overriding of dependencies', () => {
    const container = createContainer<{
      value: string
    }>()

    container.register({
      value: [() => 'original'],
    })

    assert.strictEqual(container.resolve('value'), 'original')

    container.register({
      value: [() => 'overridden'],
    })

    assert.strictEqual(container.resolve('value'), 'overridden')
  })

  it('throws an error on unregistered dependency', () => {
    const container = createContainer<{
      nonexistent: string
    }>()

    assert.throws(() => container.resolve('nonexistent'), { message: 'Resolver for nonexistent not found' })
  })

  it('respects transient scope', () => {
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

  it('respects singleton scope', () => {
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

  it('uses default scope when not specified', () => {
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

  it('allows mixing scopes', () => {
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

  describe('createScope', () => {
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
  })

  describe('cyclic dependencies detection', () => {
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

    it('allows non-cyclic dependencies', () => {
      const container = createContainer<{
        a: string
        b: string
        c: string
      }>()

      container.register({
        a: [({ b }) => `A depends on ${b}`],
        b: [({ c }) => `B depends on ${c}`],
        c: [() => 'C is independent'],
      })

      assert.doesNotThrow(() => container.resolve('a'))
      assert.strictEqual(container.resolve('a'), 'A depends on B depends on C is independent')
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

    it('allows non-cyclic dependencies across scopes', () => {
      const container = createContainer<{
        a: string
      }>()

      container.register({
        a: [() => 'A is independent'],
      })

      const scope = container.createScope<{
        b: string
      }>()

      scope.register({
        b: [({ a }) => `B depends on ${a}`],
      })

      assert.doesNotThrow(() => scope.resolve('b'))
      assert.strictEqual(scope.resolve('b'), 'B depends on A is independent')
    })
  })
})
