import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// biome-ignore lint/style/noNamespaceImport: needed to test exports
import * as indexExports from '.'
// biome-ignore lint/style/noNamespaceImport: needed to test artifacts
import * as indexArtifacts from '../build/index.js'

describe('exports', () => {
  it('exists with its methods', () => {
    assert.notStrictEqual(indexExports, undefined)
    assert.strictEqual(typeof indexExports.createContainer, 'function')
  })

  it('creates a container and resolves dependencies', () => {
    const container = indexExports.createContainer<{
      value: number
      double: number
    }>()

    container.register({
      value: [() => 5],
      double: [({ value }: { value: number }) => value * 2],
    })

    assert.strictEqual(container.resolve('double'), 10)
  })
})

describe('artifacts', () => {
  it('exists with its methods', () => {
    assert.notStrictEqual(indexArtifacts, undefined)
    assert.strictEqual(typeof indexArtifacts.createContainer, 'function')
  })

  it('creates a container and resolves dependencies', () => {
    const container = indexArtifacts.createContainer<{
      value: number
      double: number
    }>()

    container.register({
      value: [() => 5],
      double: [({ value }: { value: number }) => value * 2],
    })

    assert.strictEqual(container.resolve('double'), 10)
  })
})
