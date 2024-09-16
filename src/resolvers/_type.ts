import type { Lifetime } from '../container/lifetime'

export interface Resolver<T> extends ResolverOptions {
  resolve(cradle: object): T
}

export interface ResolverOptions {
  lifetime?: Lifetime
  isLeakSafe?: boolean
}

export type Constructor<T> = { new (...args: any[]): T }
export type FunctionReturning<T> = (...args: any[]) => T

export type ClassOrFunctionReturning<T> = FunctionReturning<T> | Constructor<T>
