import type { Resolver } from '../resolvers/_type'

type RegistrationKey = string | number

export interface RegistrationStore {
  addRecord: (item: Record<RegistrationKey, Resolver<any>>) => void
  getRecord: (key: RegistrationKey) => Resolver<any> | undefined
  getRecords: () => Record<RegistrationKey, Resolver<any>>
}

export const createRegistrationStore = (parentStore?: RegistrationStore): RegistrationStore => {
  const store: Record<RegistrationKey, Resolver<any>> = {}

  const addRecord = (item: Record<RegistrationKey, Resolver<any>>) => {
    Object.assign(store, item)
  }

  const getRecord = (key: RegistrationKey): Resolver<any> | undefined => {
    return store[key] ?? parentStore?.getRecord(key)
  }

  const getRecords = () => {
    return { ...parentStore?.getRecords(), ...store }
  }

  return { addRecord, getRecord, getRecords }
}
