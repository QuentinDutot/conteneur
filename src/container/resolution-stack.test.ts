import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createResolutionStack } from './resolution-stack'

describe('createResolutionStack', () => {
  it('adds and pops modules correctly', () => {
    const stack = createResolutionStack()
    stack.addModule({ name: 'module1', lifetime: 'singleton' })
    stack.addModule({ name: 'module2', lifetime: 'transient' })

    assert.deepStrictEqual(stack.getNames(), ['module1', 'module2'])

    stack.popModule()
    assert.deepStrictEqual(stack.getNames(), ['module1'])
  })

  it('checks if a module exists', () => {
    const stack = createResolutionStack()
    stack.addModule({ name: 'module1', lifetime: 'singleton' })

    assert.strictEqual(stack.hasModule('module1'), true)
    assert.strictEqual(stack.hasModule('nonexistent'), false)
  })

  it('finds a module based on a condition', () => {
    const stack = createResolutionStack()
    stack.addModule({ name: 'module1', lifetime: 'singleton' })
    stack.addModule({ name: 'module2', lifetime: 'transient' })

    const found = stack.findModule((item) => item.lifetime === 'transient')
    assert.deepStrictEqual(found, { name: 'module2', lifetime: 'transient' })
  })

  it('clears the stack', () => {
    const stack = createResolutionStack()
    stack.addModule({ name: 'module1', lifetime: 'singleton' })
    stack.addModule({ name: 'module2', lifetime: 'transient' })

    stack.clearStack()
    assert.deepStrictEqual(stack.getNames(), [])
  })

  it('gets all module names', () => {
    const stack = createResolutionStack()
    stack.addModule({ name: 'module1', lifetime: 'singleton' })
    stack.addModule({ name: 'module2', lifetime: 'transient' })
    stack.addModule({ name: 'module3', lifetime: 'scoped' })

    assert.deepStrictEqual(stack.getNames(), ['module1', 'module2', 'module3'])
  })
})
