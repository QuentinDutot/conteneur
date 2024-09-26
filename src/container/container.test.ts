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
})
