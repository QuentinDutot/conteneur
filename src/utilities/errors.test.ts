import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createResolutionStack } from '../container/resolution-stack'
import { getCradleSetError, getInvalidTypeError, getRegistrationError, getResolutionError } from './errors'

describe('getCradleSetError', () => {
  it('returns the correct error message', () => {
    const error = getCradleSetError({ name: 'testProperty' })
    assert.ok(error.message.includes('testProperty'))
    assert.ok(error.message.includes('not allowed'))
  })
})

describe('getInvalidTypeError', () => {
  it('returns the correct error message', () => {
    const error = getInvalidTypeError({ name: 'testFunction', expect: 'string' })
    assert.ok(error.message.includes('testFunction'))
    assert.ok(error.message.includes('string'))
    assert.ok(error.message.includes('invalid type'))
  })
})

describe('getRegistrationError', () => {
  it('returns the correct error message', () => {
    const error = getRegistrationError({ name: 'testSingleton' })
    assert.ok(error.message.includes('testSingleton'))
    assert.ok(error.message.includes('not allowed'))
  })
})

describe('getResolutionError', () => {
  it('returns the correct error message with resolution path', () => {
    const resolutionStack = createResolutionStack()
    resolutionStack.addModule({ name: 'dependency1', lifetime: 'transient' })
    resolutionStack.addModule({ name: 'dependency2', lifetime: 'scoped' })

    const error = getResolutionError({
      name: 'testDependency',
      message: 'Dependency not found',
      resolutionStack: resolutionStack,
    })
    assert.ok(error.message.includes('testDependency'))
    assert.ok(error.message.includes('dependency1 -> dependency2 -> testDependency'))
  })
})
