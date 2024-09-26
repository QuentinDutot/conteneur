import type {
  ContainerInstance,
  ContainerOptions,
  RegistryOptions,
  ResolverEntries,
  ResolverFunction,
  ResolverInterface,
} from '../types'

export const createContainer = <Registrations extends Record<string, unknown>>(
  options?: ContainerOptions,
): ContainerInstance<Registrations> => createRegistry<Registrations>(options)

const createRegistry = <Registrations extends Record<string, unknown>>(
  options?: RegistryOptions,
): ContainerInstance<Registrations> => {
  const defaultStrategy = options?.defaultStrategy ?? 'transient'
  const parentRegistry = options?.parentRegistry

  const registrationMap = new Map<string, ResolverInterface<unknown>>()
  const resolutionCache = new Map<string, unknown>()
  const resolutionStack: string[] = []

  const cradle = new Proxy<Registrations>({} as Registrations, {
    get: (_target: unknown, key: string) => resolve(key),
    set: (_target: unknown, key: string) => {
      throw new Error(`Direct assignment for ${key} is not allowed`)
    },
  })

  const register = (entries: ResolverEntries): void => {
    for (const [key, [resolver, options]] of Object.entries(entries)) {
      registrationMap.set(key, {
        resolve: resolver,
        strategy: options?.strategy ?? defaultStrategy,
      })
    }
  }

  const resolve = <Key extends keyof Registrations>(key: Key): Registrations[Key] => {
    if (resolutionStack.includes(key as string)) {
      throw new Error(`Cyclic dependency detected: ${resolutionStack.join(' -> ')} -> ${String(key)}`)
    }

    resolutionStack.push(key as string)

    const resolver = registrationMap.get(key as string) ?? parentRegistry?.registrationMap.get(key as string)
    if (!resolver) {
      resolutionStack.pop()

      throw new Error(`Resolver for ${String(key)} not found`)
    }

    let resolved: Registrations[Key]
    if (resolver.strategy === 'singleton') {
      let cached = resolutionCache.get(key as string)
      if (cached === undefined) {
        cached = resolver.resolve(cradle)
        resolutionCache.set(key as string, cached)
      }

      resolved = cached as Registrations[Key]
    } else {
      resolved = resolver.resolve(cradle) as Registrations[Key]
    }

    resolutionStack.pop()

    return resolved
  }

  const inject = <Module>(target: ResolverFunction<Module>): Module => target(cradle)

  const createScope = <ScopeRegistrations extends Record<string, unknown>>(): ContainerInstance<
    Registrations & ScopeRegistrations
  > =>
    createRegistry<Registrations & ScopeRegistrations>({
      defaultStrategy,
      parentRegistry: { registrationMap },
    })

  return { register, resolve, inject, createScope }
}
