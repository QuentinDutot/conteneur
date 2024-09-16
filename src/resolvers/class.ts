import { getInvalidTypeError } from '../utilities/errors'
import { isFunction } from '../utilities/types'
import type { Constructor, Resolver, ResolverOptions } from './_type'

/**
 * Creates a resolver for a class constructor.
 */
export const asClass = <T = object>(target: Constructor<T>, options?: ResolverOptions): Resolver<T> => {
  if (!isFunction(target)) {
    throw getInvalidTypeError({ name: 'asClass', expect: 'a class' })
  }

  const factory = (...args: unknown[]) => Reflect.construct(target, args)

  return {
    resolve: (cradle) => factory(cradle),
    lifetime: 'transient',
    ...options,
  }
}
