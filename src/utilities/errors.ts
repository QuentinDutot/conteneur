import type { ResolutionStack } from '../container/resolution-stack'

export const getCradleSetError = (params: { name: string }): Error =>
  new Error(`Setting property "${params.name}" on container cradle is not allowed.`)

export const getInvalidTypeError = (params: { name: string; expect: string }): Error =>
  new Error(`The function "${params.name}" expected "${params.expect}" but got an invalid type.`)

export const getRegistrationError = (params: { name: string }): Error =>
  new Error(`Registering singleton "${params.name}" on a scoped container is not allowed.`)

export const getResolutionError = (params: {
  name: string
  message: string
  resolutionStack: ResolutionStack
}): Error =>
  new Error(
    `Resolving "${params.name}" failed. ${params.message}\n\nResolution path : ${[...params.resolutionStack.getNames(), params.name].join(' -> ')}`,
  )
