// -----------------------------------------------
// RESOLVER
// -----------------------------------------------

// biome-ignore lint/suspicious/noExplicitAny: any is fine here
export type ResolverFunction<Module> = (cradle: any) => Module

export type ResolverStrategy = 'transient' | 'singleton'

export interface ResolverInterface<Module> {
  resolve: ResolverFunction<Module>
  strategy?: ResolverStrategy
}

export interface ResolverOptions {
  strategy?: ResolverStrategy
}

export type ResolverEntries = Record<string, [ResolverFunction<unknown>, ResolverOptions?]>

// -----------------------------------------------
// CONTAINER
// -----------------------------------------------

export interface ContainerInstance<Registrations extends object> {
  register: (entries: ResolverEntries) => void
  resolve: <Key extends keyof Registrations>(key: Key) => Registrations[Key]
  inject: <Module>(target: ResolverFunction<Module>) => Module
  createScope: <ScopeRegistrations extends object>() => ContainerInstance<Registrations & ScopeRegistrations>
}

export interface ContainerOptions {
  defaultStrategy?: ResolverStrategy
}

// -----------------------------------------------
// REGISTRY
// -----------------------------------------------

export interface RegistryInstance {
  registrationMap: Map<string, ResolverInterface<unknown>>
}

export interface RegistryOptions extends ContainerOptions {
  parentRegistry?: RegistryInstance
}
