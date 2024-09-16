# ConteneurJS

[![npm](https://img.shields.io/npm/v/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![npm](https://img.shields.io/npm/dt/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![CI](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml/badge.svg)](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml)

Conteneur is a lightweight, efficient **Inversion of Control** container that enables **Dependency Injection**, supporting both **Factory Functions** and **Classes** without decorators.

- 🪶 3.68KB minified
- 🧩 Zero dependencies
- 📦 TypeScript and ESM
- 🧪 100% Test Coverage
- 🌐 Platform Agnostic (Browser, Node, Deno, Bun, AWS, Vercel, Cloudflare, ..)

## 🚀 Usage

```js
import { createContainer, asClass, asFunction, asValue } from 'conteneur'

const container = createContainer<Container>()

container.register({
  connectionString: asValue(process.env.DATABASE_URL),
  database: asClass(Database),
  userService: asFunction(createUserService),
  userController: asFunction(createUserController)
})

const userController = container.resolve('userController')
```

## 🎁 Public APIs

- **createContainer**

Creates a new container, does not take options.

```js
createContainer(): Container
```

- **asFunction**

Creates a factory function resolver.

```js
asFunction(myFactory: Function, options?: Options): Resolver
```

`options.lifetime` : *transient* (default) - *singleton* - *scoped*

- **asClass**

Creates a class resolver.

```js
asClass(myClass: Class, options?: Options): Resolver
```

`options.lifetime` : *transient* (default) - *singleton* - *scoped*

- **asValue**

Creates a value resolver.

```js
asValue(myValue: Primitive): Resolver
```

## 🔋 Container APIs

- **register**

Registers multiple resolvers within the container.

```js
container.register(modules: Record<string, Resolver>): void
```

- **resolve**

Injects a function or class **registered** in the container with its dependencies and returns the result.
Values are returned as is.

```js
container.resolve<T  extends keyof Container>(name: T): Container[T]
```

- **build**

Injects a function or class **not registered** in the container with its dependencies and returns the result.

```js
container.build<T>(target: ClassOrFunctionReturning<T>): T
```

- **createScope**

Creates a new scope within the container, does not take options.

```js
container.createScope():  void
```

## 📃 Examples

- **Simple**
  - [Function](./docs/simple/function.md)
  - [Class](./docs/simple/class.md)
  - [Value](./docs/simple/value.md)
  - [Hybrid](./docs/simple/hybrid.md)

## 📃 Inspiration

This project is inspired by [jeffijoe/awilix](https://github.com/jeffijoe/awilix) and builds upon its core concepts.
