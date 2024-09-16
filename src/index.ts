// biome-ignore lint/performance/noBarrelFile: expose public apis
export { createContainer, type Container } from './container/container'
export type { Lifetime } from './container/lifetime'

export { asClass } from './resolvers/class'
export { asFunction } from './resolvers/function'
export { asValue } from './resolvers/value'
