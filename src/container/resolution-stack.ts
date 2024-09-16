import type { Lifetime } from './lifetime'

type FindPredicate = (item: ResolutionModule) => boolean

interface ResolutionModule {
  name: string
  lifetime: Lifetime
}

export interface ResolutionStack {
  addModule: (item: ResolutionModule) => void
  popModule: () => void
  hasModule: (name: string) => boolean
  findModule: (find: FindPredicate) => ResolutionModule | undefined
  clearStack: () => void
  getNames: () => string[]
}

// track the modules resolved to detect circular dependencies and lifetime leakage issues

export const createResolutionStack = (): ResolutionStack => {
  const stack: ResolutionModule[] = []

  const addModule = (item: ResolutionModule) => {
    stack.push(item)
  }

  const popModule = () => {
    stack.pop()
  }

  const hasModule = (name: string) => stack.some((item) => item.name === name)

  const findModule = (find: FindPredicate) => stack.find(find)

  const clearStack = () => {
    stack.length = 0
  }

  const getNames = () => stack.map((item) => item.name)

  return { addModule, popModule, hasModule, findModule, clearStack, getNames }
}
