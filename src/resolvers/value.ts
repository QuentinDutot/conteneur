import type { Resolver } from './_type'

/**
 * Creates a resolver for a value. Marked as leak-safe.
 */
export const asValue = <T>(input: T): Resolver<T> => ({
  resolve: () => input,
  isLeakSafe: true,
})
