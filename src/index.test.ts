import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContainer } from './container/container'
import { asClass } from './resolvers/class'
import { asFunction } from './resolvers/function'
import { asValue } from './resolvers/value'

// biome-ignore lint/style/noNamespaceImport: needed to test exports
import * as indexExports from '.'
// biome-ignore lint/style/noNamespaceImport: needed to test artifacts
import * as indexArtifacts from '../build/index.js'

describe('index exports', () => {
  it('exists', () => {
    assert.notStrictEqual(indexExports, undefined)
  })

  it('has a createContainer function', () => {
    assert.strictEqual(indexExports.createContainer, createContainer)
  })

  it('has the asValue, asClass, asFunction functions', () => {
    assert.strictEqual(indexExports.asValue, asValue)
    assert.strictEqual(indexExports.asClass, asClass)
    assert.strictEqual(indexExports.asFunction, asFunction)
  })
})

describe('index artifacts', () => {
  it('creates a container and resolves dependencies', () => {
    const container = indexArtifacts.createContainer()

    container.register({
      value: indexArtifacts.asValue(5),
      double: indexArtifacts.asFunction((cradle) => cradle.value * 2),
    })

    assert.strictEqual(container.resolve('double'), 10)
  })
})
