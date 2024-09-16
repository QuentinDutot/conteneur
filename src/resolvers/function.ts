import { getInvalidTypeError } from '../utilities/errors'
import { isFunction } from '../utilities/types'
import type { FunctionReturning, Resolver, ResolverOptions } from './_type'

/**
 * Creates a resolver for a factory function.
 */
export const asFunction = <T>(factory: FunctionReturning<T>, options?: ResolverOptions): Resolver<T> => {
  if (!isFunction(factory)) {
    throw getInvalidTypeError({ name: 'asFunction', expect: 'a function' })
  }

  return {
    resolve: (cradle) => factory(cradle),
    lifetime: 'transient',
    ...options,
  }
}
