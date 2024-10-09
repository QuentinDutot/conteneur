// -----------------------------------------------
// RESOLVER
// -----------------------------------------------

// biome-ignore lint/suspicious/noExplicitAny: any is fine here
export type ResolverTargetFunction<Module> = (cradle: any) => Module
// biome-ignore lint/suspicious/noExplicitAny: any is fine here
export type ResolverTargetClass<Module> = new (cradle: any) => Module

export type ResolverTarget<Module> = ResolverTargetFunction<Module> | ResolverTargetClass<Module>

export type ResolverStrategy = 'transient' | 'singleton'

export interface ResolverInterface<Module> {
  target: ResolverTarget<Module>
  strategy?: ResolverStrategy
}

export interface ResolverOptions {
  strategy?: ResolverStrategy
}

export type ResolverEntries = Record<string, [ResolverTarget<unknown>, ResolverOptions?]>

// -----------------------------------------------
// CONTAINER
// -----------------------------------------------

export interface ContainerInstance<Registrations extends object> {
  register: (entries: ResolverEntries) => void
  resolve: <Key extends keyof Registrations>(key: Key) => Registrations[Key]
  inject: <Module>(target: ResolverTarget<Module>) => Module
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
