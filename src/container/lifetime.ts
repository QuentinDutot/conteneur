/**
 * Dependency lifetime in the container:
 * - transient : new instance per resolution
 * - singleton : single instance for entire app
 * - scoped : new instance per container scope
 */
export type Lifetime = 'transient' | 'singleton' | 'scoped'

// returns true if the first lifetime is longer than the second one
export const isLifetimeLonger = (a: Lifetime, b: Lifetime): boolean =>
  (a === 'singleton' && b !== 'singleton') || (a === 'scoped' && b === 'transient')
