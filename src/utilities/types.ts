export const isClass = (input: unknown): boolean => typeof input === 'function' && /^class\b/.test(input.toString())

export const isFunction = (input: unknown): boolean => typeof input === 'function'
