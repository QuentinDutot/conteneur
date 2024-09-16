import type { Resolver } from '../resolvers/_type'

export interface CacheEntry<T = unknown> {
  resolver: Resolver<T>
  value: T
}

export interface ResolutionCache {
  setEntry: (key: string, value: CacheEntry) => void
  getEntry: (key: string) => CacheEntry | undefined
}

export const createResolutionCache = (): ResolutionCache => {
  const cache = new Map<string, CacheEntry>()

  const setEntry = cache.set.bind(cache)

  const getEntry = cache.get.bind(cache)

  return { setEntry, getEntry }
}
