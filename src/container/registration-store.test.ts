import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRegistrationStore } from './registration-store'

describe('createRegistrationStore', () => {
  it('adds and retrieves records', () => {
    const store = createRegistrationStore()
    const resolver = { resolve: () => 'test' }

    store.addRecord({ testKey: resolver })

    assert.strictEqual(store.getRecord('testKey'), resolver)
  })

  it('retrieves all records', () => {
    const store = createRegistrationStore()
    const resolver1 = { resolve: () => 'test1' }
    const resolver2 = { resolve: () => 'test2' }

    store.addRecord({ key1: resolver1, key2: resolver2 })

    const records = store.getRecords()
    assert.deepStrictEqual(records, { key1: resolver1, key2: resolver2 })
  })

  it('falls back to parent store when record not found', () => {
    const parentStore = createRegistrationStore()
    const childStore = createRegistrationStore(parentStore)
    const parentResolver = { resolve: () => 'parent' }
    const childResolver = { resolve: () => 'child' }

    parentStore.addRecord({ parentKey: parentResolver })
    childStore.addRecord({ childKey: childResolver })

    assert.strictEqual(childStore.getRecord('parentKey'), parentResolver)
    assert.strictEqual(childStore.getRecord('childKey'), childResolver)
  })

  it('merges parent and child records', () => {
    const parentStore = createRegistrationStore()
    const childStore = createRegistrationStore(parentStore)
    const parentResolver = { resolve: () => 'parent' }
    const childResolver = { resolve: () => 'child' }

    parentStore.addRecord({ parentKey: parentResolver })
    childStore.addRecord({ childKey: childResolver })

    const records = childStore.getRecords()
    assert.deepStrictEqual(records, { parentKey: parentResolver, childKey: childResolver })
  })

  it('overrides parent records with child records', () => {
    const parentStore = createRegistrationStore()
    const childStore = createRegistrationStore(parentStore)
    const parentResolver = { resolve: () => 'parent' }
    const childResolver = { resolve: () => 'child' }

    parentStore.addRecord({ key: parentResolver })
    childStore.addRecord({ key: childResolver })

    assert.strictEqual(childStore.getRecord('key'), childResolver)
    assert.deepStrictEqual(childStore.getRecords(), { key: childResolver })
  })
})
