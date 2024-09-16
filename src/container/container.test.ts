import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { asClass } from '../resolvers/class'
import { asFunction } from '../resolvers/function'
import { asValue } from '../resolvers/value'
import { createContainer } from './container'

class Test {
  repo: Repo
  constructor({ repo }: any) {
    this.repo = repo
  }

  stuff() {
    return this.repo.getStuff()
  }
}

class Repo {
  getStuff() {
    return 'stuff'
  }
}

describe('createContainer', () => {
  it('returns an object', () => {
    const container = createContainer()
    assert.strictEqual(typeof container, 'object')
  })
})

describe('container', () => {
  it('lets me register something and resolve it', () => {
    const container = createContainer()
    container.register({ someValue: asValue(42) })
    container.register({
      test: asFunction((deps: any) => {
        return {
          someValue: deps.someValue,
        }
      }),
    })

    const test = container.resolve('test')
    assert.ok(test)
    assert.strictEqual(test.someValue, 42)
  })

  describe('register', () => {
    it('supports multiple registrations in a single call', () => {
      const container = createContainer()
      container.register({
        universe: asValue(42),
        leet: asValue(1337),
      })

      container.register({
        service: asFunction(({ func, universe }: any) => ({
          method: () => func(universe),
        })),
        func: asFunction(() => (answer: any) => `Hello world, the answer is ${answer}`),
      })

      assert.strictEqual(container.resolve<any>('universe'), 42)
      assert.strictEqual(container.resolve<any>('service').method(), 'Hello world, the answer is 42')
    })

    it('supports classes', () => {
      const container = createContainer()
      container.register({
        test: asClass(Test),
        repo: asClass(Repo),
      })

      assert.strictEqual(container.resolve<Test>('test').stuff(), 'stuff')
    })
  })

  describe('resolve', () => {
    it('resolves the dependency graph and supports all resolvers', () => {
      class TestClass {
        factoryResult: unknown
        constructor({ factory }: { factory: () => unknown }) {
          this.factoryResult = factory()
        }
      }

      const factorySpy = (cradle: { value: number }) => `factory ${cradle.value}`
      const container = createContainer()
      container.register({ value: asValue(42) })
      container.register({
        factory: asFunction((cradle: { value: number }) => () => factorySpy(cradle)),
      })
      container.register({ theClass: asClass(TestClass) })

      const root = container.resolve<TestClass>('theClass')
      assert.strictEqual(root.factoryResult, 'factory 42')
    })

    it('throws when there are unregistered dependencies', () => {
      const container = createContainer()
      assert.throws(() => container.resolve('nope'))
    })

    it('throws with a resolution path when resolving an unregistered dependency', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.second),
        second: asFunction((cradle: any) => cradle.third),
        third: asFunction((cradle: any) => cradle.unregistered),
      })

      assert.throws(() => container.resolve('first'), {
        message: /first -> second -> third/,
      })
    })

    it('does not screw up the resolution stack when called twice', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.second),
        otherFirst: asFunction((cradle: any) => cradle.second),
        second: asFunction((cradle: any) => cradle.third),
        third: asFunction((cradle: any) => cradle.unregistered),
      })

      assert.throws(() => container.resolve('first'), {
        message: /first -> second -> third/,
      })
      assert.throws(() => container.resolve('otherFirst'), {
        message: /otherFirst -> second -> third/,
      })
    })

    it('supports transient lifetime', () => {
      const container = createContainer()
      let counter = 1
      container.register({
        hehe: asFunction(() => counter++, { lifetime: 'transient' }),
      })

      assert.strictEqual(container.resolve('hehe'), 1)
      assert.strictEqual(container.resolve('hehe'), 2)
    })

    it('supports singleton lifetime', () => {
      const container = createContainer()
      let counter = 1
      container.register({
        hehe: asFunction(() => counter++, { lifetime: 'singleton' }),
      })

      assert.strictEqual(container.resolve('hehe'), 1)
      assert.strictEqual(container.resolve('hehe'), 1)
    })

    it('supports scoped lifetime', () => {
      const container = createContainer()
      let scopedCounter = 1
      container.register({
        scoped: asFunction(() => scopedCounter++, { lifetime: 'scoped' }),
      })
      const scope1 = container.createScope()
      assert.strictEqual(scope1.resolve('scoped'), 1)
      assert.strictEqual(scope1.resolve('scoped'), 1)

      const scope2 = container.createScope()
      assert.strictEqual(scope2.resolve('scoped'), 2)
      assert.strictEqual(scope2.resolve('scoped'), 2)
    })

    it('caches singletons regardless of scope', () => {
      const container = createContainer()
      let singletonCounter = 1
      container.register({
        singleton: asFunction(() => singletonCounter++, { lifetime: 'singleton' }),
      })

      const scope1 = container.createScope()
      assert.strictEqual(scope1.resolve('singleton'), 1)
      assert.strictEqual(scope1.resolve('singleton'), 1)

      const scope2 = container.createScope()
      assert.strictEqual(scope2.resolve('singleton'), 1)
      assert.strictEqual(scope2.resolve('singleton'), 1)
    })

    it('resolves transients regardless of scope', () => {
      const container = createContainer()
      let transientCounter = 1
      container.register({
        transient: asFunction(() => transientCounter++, { lifetime: 'transient' }),
      })

      const scope1 = container.createScope()
      assert.strictEqual(scope1.resolve('transient'), 1)
      assert.strictEqual(scope1.resolve('transient'), 2)

      const scope2 = container.createScope()
      assert.strictEqual(scope2.resolve('transient'), 3)
      assert.strictEqual(scope2.resolve('transient'), 4)
    })

    it('does not use parents cache when scoped', () => {
      const container = createContainer()
      let scopedCounter = 1
      container.register({
        scoped: asFunction(() => scopedCounter++, { lifetime: 'scoped' }),
      })

      const scope1 = container.createScope()
      assert.strictEqual(scope1.resolve('scoped'), 1)
      assert.strictEqual(scope1.resolve('scoped'), 1)

      const scope2 = scope1.createScope()
      assert.strictEqual(scope2.resolve('scoped'), 2)
      assert.strictEqual(scope2.resolve('scoped'), 2)

      assert.strictEqual(container.resolve('scoped'), 3)
      assert.strictEqual(container.resolve('scoped'), 3)
      assert.strictEqual(scope2.resolve('scoped'), 2)
      assert.strictEqual(scope1.resolve('scoped'), 1)
    })

    it('supports the readme example of scopes', () => {
      // Increments the counter every time it is resolved.
      const container = createContainer()
      let counter = 1
      container.register({
        counterValue: asFunction(() => counter++, { lifetime: 'scoped' }),
      })
      const scope1 = container.createScope()
      const scope2 = container.createScope()

      const scope1Child = scope1.createScope()
      assert.strictEqual(scope1.resolve('counterValue'), 1)
      assert.strictEqual(scope1.resolve('counterValue'), 1)
      assert.strictEqual(scope2.resolve('counterValue'), 2)
      assert.strictEqual(scope2.resolve('counterValue'), 2)

      assert.strictEqual(scope1Child.resolve('counterValue'), 3)
      // assert that the parent scope was not affected
      assert.strictEqual(scope1.resolve('counterValue'), 1)
    })

    it('supports nested scopes', () => {
      const container = createContainer()

      // Increments the counter every time it is resolved.
      let counter = 1
      container.register({
        counterValue: asFunction(() => counter++, { lifetime: 'scoped' }),
      })
      const scope1 = container.createScope()
      const scope2 = container.createScope()

      const scope1Child = scope1.createScope()
      assert.strictEqual(scope1.resolve('counterValue'), 1)
      assert.strictEqual(scope1.resolve('counterValue'), 1)
      assert.strictEqual(scope2.resolve('counterValue'), 2)
      assert.strictEqual(scope2.resolve('counterValue'), 2)
      assert.strictEqual(scope1Child.resolve('counterValue'), 3)
    })

    it('resolves dependencies in scope', () => {
      const container = createContainer()
      // Register a transient function
      // that returns the value of the scope-provided dependency.
      // For this example we could also use scoped lifetime.
      container.register({
        scopedValue: asFunction((cradle: any) => `Hello ${cradle.someValue}`),
      })

      // Create a scope and register a value.
      const scope = container.createScope()
      scope.register({
        someValue: asValue('scope'),
      })

      assert.strictEqual(scope.resolve('scopedValue'), 'Hello scope')
    })

    it('cannot find a scope-registered value when resolved from root', () => {
      const container = createContainer()
      // Register a transient function
      // that returns the value of the scope-provided dependency.
      // For this example we could also use scoped lifetime.
      container.register({
        scopedValue: asFunction((cradle: any) => `Hello ${cradle.someValue}`),
      })

      // Create a scope and register a value.
      const scope = container.createScope()
      scope.register({
        someValue: asValue('scope'),
      })
      assert.throws(() => container.resolve('scopedValue'))
    })

    it('supports overwriting values in a scope', () => {
      const container = createContainer()
      // It does not matter when the scope is created,
      // it will still have anything that is registered
      // in it's parent.
      const scope = container.createScope()

      container.register({
        value: asValue('root'),
        usedValue: asFunction((cradle: any) => cradle.value),
      })

      scope.register({
        value: asValue('scope'),
      })
      assert.strictEqual(container.resolve('usedValue'), 'root')
      assert.strictEqual(scope.resolve('usedValue'), 'scope')
    })

    it('throws when there are cyclic dependencies', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.second),
        second: asFunction((cradle: any) => cradle.third),
        third: asFunction((cradle: any) => cradle.second),
      })

      assert.throws(() => container.resolve('first'), {
        message: /first -> second -> third -> second/,
      })
    })

    it('throws when the lifetime is unknown', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.second),
        second: asFunction(() => 'hah', { lifetime: 'lol' as any }),
      })
      assert.throws(() => container.resolve('first'), { message: /first -> second/ })
    })
  })

  it('parses parent classes if there are no declared parameters', () => {
    const container = createContainer()

    class Level1 {
      arg1: number
      arg2: number

      constructor({ arg1, arg2 }: { arg1: number; arg2: number }) {
        this.arg1 = arg1
        this.arg2 = arg2
      }
    }

    class Level2 extends Level1 {}

    container.register({
      arg1: asValue(1),
      arg2: asValue(2),
      level1: asClass(Level1),
      level2: asClass(Level2),
    })

    const level1 = container.resolve('level1')
    assert.strictEqual(level1.arg1, 1)
    assert.strictEqual(level1.arg2, 2)

    const level2 = container.resolve('level2')
    assert.strictEqual(level2.arg1, 1)
    assert.strictEqual(level2.arg2, 2)
  })

  describe('explicitly trying to fuck shit up', () => {
    it('should prevent you from fucking shit up', () => {
      const container = createContainer().register({
        answer: asValue(42),
        theAnswer: asFunction(
          ({ answer }: any) =>
            () =>
              answer,
        ),
      })

      const theAnswer = container.resolve<() => number>('theAnswer')
      assert.strictEqual(theAnswer(), 42)
    })
  })

  describe('lifetime mismatch check', () => {
    it('throws when longer lifetime modules depend on shorter lifetime dependencies', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.second, {
          lifetime: 'scoped',
        }),
        second: asFunction(() => 'hah'),
      })

      assert.throws(() => container.resolve('first'))
    })

    it('allows for asValue() to be used', () => {
      const container = createContainer()
      container.register({
        first: asFunction((cradle: any) => cradle.val, {
          lifetime: 'scoped',
        }),
        second: asFunction((cradle: any) => cradle.secondVal, {
          lifetime: 'singleton',
        }),
        val: asValue('hah'),
        secondVal: asValue('foobar'),
      })

      assert.strictEqual(container.resolve('first'), 'hah')
      assert.strictEqual(container.resolve('second'), 'foobar')
    })
  })

  describe('singleton resolution using only root container', () => {
    it('resolves singletons using root container only, even if called from scope', () => {
      const container = createContainer()
      container.register({
        scoped: asFunction((cradle: any) => cradle.val, {
          lifetime: 'scoped',
        }),
        singleton: asFunction((cradle: any) => cradle.val, {
          lifetime: 'singleton',
        }),
      })
      const scope = container.createScope()

      assert.throws(() => scope.resolve('scoped'), { message: /scoped -> val/ })

      scope.register({
        val: asValue('foobar'),
      })

      assert.strictEqual(scope.resolve('scoped'), 'foobar')
      assert.throws(() => scope.resolve('singleton'), {
        message: /singleton -> val/,
      })

      container.register({
        val: asValue('hah'),
      })

      assert.strictEqual(scope.resolve('singleton'), 'hah')
    })

    it('preserves the resolution stack when resolving a singleton using a parent container, from a scope', () => {
      const container = createContainer()
      container.register({
        scoped: asFunction((cradle: any) => cradle.singleton, {
          lifetime: 'scoped',
        }),
        singleton: asFunction((cradle: any) => cradle.val, {
          lifetime: 'singleton',
        }),
      })
      const scope = container.createScope()
      assert.throws(() => scope.resolve('scoped'), {
        message: /scoped -> singleton -> val/,
      })
    })
  })

  describe('singleton registration on scope check', () => {
    it('detects and errors when a singleton is registered on a scope', () => {
      const container = createContainer()
      const scope = container.createScope()
      assert.throws(() => {
        scope.register({
          test: asFunction(() => 42, { lifetime: 'singleton' }),
        })
      })
    })
  })
})

describe('memoizing registrations', () => {
  it('should not cause issues', () => {
    const container = createContainer().register({ val1: asValue(123) })

    const scope1 = container.createScope()
    const scope2 = scope1.createScope()

    assert.strictEqual(scope1.resolve('val1'), 123)
    assert.strictEqual(scope2.resolve('val1'), 123)

    container.register({ val2: asValue(321) })
    assert.strictEqual(scope2.resolve('val2'), 321)
    assert.strictEqual(scope1.resolve('val2'), 321)
  })

  describe('build', () => {
    const factory = (deps: any) => deps.val
    const container = createContainer().register({ val: asValue(1337) })

    class BuildTest {
      val: any
      constructor({ val }: any) {
        this.val = val
      }
    }

    it('throws when the target is falsy', () => {
      assert.throws(() => createContainer().build(null as any))
      assert.throws(() => createContainer().build(undefined as any))
      assert.throws(() => createContainer().build({} as any))
    })

    it('returns resolved value when passed a function', () => {
      assert.strictEqual(container.build(factory), 1337)
    })

    it('returns resolved value when passed a class', () => {
      assert.ok(container.build(BuildTest) instanceof BuildTest)
      assert.strictEqual(container.build(BuildTest).val, 1337)
    })
  })
})
