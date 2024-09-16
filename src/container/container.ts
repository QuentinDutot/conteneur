import type {
  ClassOrFunctionReturning,
  Constructor,
  FunctionReturning,
  Resolver,
  ResolverOptions,
} from '../resolvers/_type'
import { asClass } from '../resolvers/class'
import { asFunction } from '../resolvers/function'
import { getCradleSetError, getInvalidTypeError, getRegistrationError, getResolutionError } from '../utilities/errors'
import { isClass } from '../utilities/types'
import { type Lifetime, isLifetimeLonger } from './lifetime'
import { type RegistrationStore, createRegistrationStore } from './registration-store'
import { type ResolutionCache, createResolutionCache } from './resolution-cache'
import { type ResolutionStack, createResolutionStack } from './resolution-stack'

/**
 * The container returned from createContainer has some methods.
 */
export interface Container<Cradle extends object = any> {
  /**
   * Pairs resolvers to registration names and registers them.
   */
  register<T extends Partial<Cradle>>(registrations: T): this
  /**
   * Resolves the registration with the given name.
   */
  resolve<K extends keyof Cradle>(name: K): Cradle[K]
  /**
   * Resolves the registration with the given name.
   */
  resolve<T>(name: string): T
  /**
   * Given a class or function, builds it up and returns it.
   * Does not cache, any lifetime configured will not be used.
   */
  build<T>(target: ClassOrFunctionReturning<T>, options?: ResolverOptions): T
  /**
   * Creates a scoped container with this one as the parent.
   */
  createScope<T extends object = object>(): Container<Cradle & T>
}

interface ContainerContext {
  containerType: 'container' | 'scope'
  containerCradle?: object
  parentRegistrationStore?: RegistrationStore
  containerResolutionStack: ResolutionStack
  containerResolutionCache: ResolutionCache
}

export const createContainer = <T extends object = any>(): Container<T> => {
  const containerCradle = undefined
  const parentRegistrationStore = undefined
  const containerResolutionStack = createResolutionStack()
  const containerResolutionCache = createResolutionCache()

  return createContainerOrScope({
    containerType: 'container',
    containerCradle,
    parentRegistrationStore,
    containerResolutionStack,
    containerResolutionCache,
  })
}

function createContainerOrScope<T extends object = any>(context: ContainerContext): Container<T> {
  const { containerType, parentRegistrationStore, containerResolutionStack, containerResolutionCache } = context

  // this store is recursively augmented with parent stores
  const localRegistrationStore = createRegistrationStore(parentRegistrationStore)

  // this cache is purely local
  const localResolutionCache = containerType === 'container' ? containerResolutionCache : createResolutionCache()

  // proxy is passed to functions so they can resolve their dependencies without knowing where they come from
  const cradle = new Proxy<T>({} as T, {
    // invoked whenever a get-call for `cradle.*` is made
    get: (_target: unknown, name: string) => resolve(name),

    // setting things on the cradle throws an error
    set: (_target: unknown, name: string) => {
      throw getCradleSetError({ name })
    },
  })

  const containerCradle = containerType === 'container' ? cradle : context.containerCradle

  function createScope<P extends object>(): Container<P & T> {
    return createContainerOrScope({
      containerType: 'scope',
      containerCradle,
      parentRegistrationStore: localRegistrationStore,
      containerResolutionStack,
      containerResolutionCache,
    })
  }

  function register<U extends Partial<T>>(registrations: U): Container<T> {
    const keys = Object.keys(registrations)

    for (const name of keys) {
      const resolver = registrations[name as keyof U] as Resolver<any>

      // Check to ensure we are not registering a singleton on a non-root container
      if (resolver.lifetime === 'singleton' && containerType === 'scope') {
        throw getRegistrationError({ name })
      }

      localRegistrationStore.addRecord({ [name]: resolver })
    }

    return container
  }

  function getResolver(name: string): Resolver<any> {
    const resolver = localRegistrationStore.getRecord(name)

    if (containerResolutionStack.hasModule(name)) {
      throw getResolutionError({
        name,
        message: 'Cyclic dependencies detected.',
        resolutionStack: containerResolutionStack,
      })
    }

    if (!resolver) {
      throw getResolutionError({
        name,
        message: 'Could not find a registration.',
        resolutionStack: containerResolutionStack,
      })
    }

    const { lifetime = 'transient', isLeakSafe } = resolver

    // If this resolver is not explicitly marked leak-safe, and any of the parents have a shorter lifetime than the one requested, throw an error.
    if (!isLeakSafe) {
      const maybeLongerLifetimeParent = containerResolutionStack.findModule(({ lifetime: parentLifetime }) =>
        isLifetimeLonger(parentLifetime, lifetime),
      )
      if (maybeLongerLifetimeParent !== undefined) {
        throw getResolutionError({
          name,
          message: `Dependency '${name.toString()}' has a shorter lifetime than its ancestor : '${maybeLongerLifetimeParent.name.toString()}'.`,
          resolutionStack: containerResolutionStack,
        })
      }
    }

    return resolver
  }

  function resolve(name: string): any {
    try {
      const resolver = getResolver(name)
      const lifetime: Lifetime = resolver.lifetime ?? 'transient'

      // Pushes the currently-resolving module information onto the stack
      containerResolutionStack.addModule({ name, lifetime })

      let resolved: unknown
      switch (lifetime) {
        case 'transient':
          // Transient lifetime means resolve every time.
          resolved = resolver.resolve(cradle)
          break
        case 'singleton': {
          // Singleton lifetime means cache at all times, regardless of scope.
          const cached = containerResolutionCache.getEntry(name)
          if (cached) {
            resolved = cached.value
          } else {
            // Perform singleton resolution using the root container only
            resolved = resolver.resolve(containerCradle as object)
            containerResolutionCache.setEntry(name, { resolver, value: resolved })
          }
          break
        }
        case 'scoped': {
          // Scoped lifetime means that the container that resolves the registration also caches it.
          // If this container cache does not have it, resolve and cache it rather than using the parent container's cache.
          const cached = localResolutionCache.getEntry(name)
          if (cached !== undefined) {
            resolved = cached.value
            break
          }

          // If we still have not found one, we need to resolve and cache it.
          resolved = resolver.resolve(cradle)
          localResolutionCache.setEntry(name, { resolver, value: resolved })
          break
        }
        default:
          throw getResolutionError({
            name,
            message: `Unknown lifetime "${resolver.lifetime}".`,
            resolutionStack: containerResolutionStack,
          })
      }

      // Pop it from the stack again, ready for the next resolution
      containerResolutionStack.popModule()
      return resolved
    } catch (error) {
      // When we get an error we need to reset the stack
      containerResolutionStack.clearStack()
      throw error
    }
  }

  function build<T>(target: ClassOrFunctionReturning<T>, options?: ResolverOptions): T {
    if (!target || typeof target !== 'function') {
      throw getInvalidTypeError({ name: 'build', expect: 'a function or a class' })
    }

    const resolver = isClass(target)
      ? asClass(target as Constructor<T>, options)
      : asFunction(target as FunctionReturning<T>, options)

    return resolver.resolve(cradle)
  }

  const container: Container<T> = {
    register,
    resolve,
    build,
    createScope,
  }

  return container
}
