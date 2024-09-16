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

## 📊 Comparisons
|                     | ConteneurJS | InversifyJS | TSyringe  | TypeDI   | Awilix    |
|---------------------|-------------|-------------|-----------|----------|-----------|
| TS + ESM + Tests    | ✅          | ✅          | ✅        | ✅       | ✅        |
| Dependency Count    | 🥇 0        | 🥈 1        | 🥈 1      | 🥇 0     | 🥉 2      |
| Platform Agnostic   | ✅          | ❌          | ❌        | ❌       | ❌        |
| Function Support    | ✅          | ❌          | ❌        | ❌       | ✅        |
| Class Support       | ✅          | ✅          | ✅        | ✅       | ✅        |
| Value Support       | ✅          | ❌          | ❌        | ❌       | ✅        |
| Decorator Free      | ✅          | ❌          | ❌        | ❌       | ✅        |
| Lifetime Management | ✅          | ✅          | ✅        | ✅       | ✅        |
| Scoped Container    | ✅          | ✅          | ✅        | ❌       | ✅        |
| Size (min)          | 🥇 3.4kb    | ➖ 49.9kb   | ➖ 15.6kb | 🥈 9.5kb | 🥉 12.5kb |
| Size (min + gzip)   | 🥇 1.4kb    | ➖ 11.1kb   | ➖ 4.7kb  | 🥈 2.7kb | 🥉 4.6kb  |

## 📃 Examples

- **Basics**
  - [Function](./docs/basics/function.md)
  - [Class](./docs/basics/class.md)
  - [Value](./docs/basics/value.md)
  - [Hybrid](./docs/basics/hybrid.md)

- **Features**
  - [TypeScript](./docs/features/typescript.md) [WIP]
  - [Lifetime](./docs/features/lifetime.md) [WIP]
  - [Scope](./docs/features/scoped.md) [WIP]
  - [Errors](./docs/features/errors.md) [WIP]

- **Integrations**
  - [Express](./docs/integrations/express.md) [WIP]
  - [Fastify](./docs/integrations/fastify.md) [WIP]
  - [Hono](./docs/integrations/hono.md) [WIP]
  - [Cloudflare](./docs/integrations/cloudflare.md) [WIP]

## 📃 Inspiration

This project is inspired by [jeffijoe/awilix](https://github.com/jeffijoe/awilix) and builds upon its core concepts.
