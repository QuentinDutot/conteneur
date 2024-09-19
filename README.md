# ConteneurJS

[![npm](https://img.shields.io/npm/v/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![npm](https://img.shields.io/npm/dt/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![CI](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml/badge.svg)](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml)

Conteneur is a lightweight, efficient **Inversion of Control** container for **Dependency Injection** with **Factory Functions**.

- 🪶 3.68KB minified
- 🧩 Zero dependencies
- 📦 TypeScript and ESM
- 🧪 100% Test Coverage
- 🌐 Platform Agnostic (Browser, Node, Deno, Bun, AWS, Vercel, Cloudflare, ..)

## 🚀 Usage

```js
import { createContainer } from 'conteneur'

const container = createContainer<Container>()

container.register({
  connectionString: [() => process.env.DATABASE_URL, { strategy: 'singleton' }],
  database: [() => new Database()],
  userService: [createUserService],
  userController: [createUserController]
})

const userController = container.resolve('userController')
```

## 🔋 APIs

Creates a new container.

```js
createContainer(options?: ContainerOptions): Container
```

`options.defaultStrategy` : *transient* (default) - *singleton*

### register

Registers multiple resolvers within the container.

```js
container.register(entries: ResolverEntries): void
```

`options.strategy` : *transient* (default) - *singleton*

### resolve

Injects a function **registered** in the container with its dependencies and returns the result.

```js
container.resolve<Key  extends keyof Container>(key: Key): Container[Key]
```

### inject

Injects a function **not registered** in the container with its dependencies and returns the result.

```js
container.inject<T>(target: ClassOrFunctionReturning<T>): T
```

### createScope

Creates a new scope within the container.

```js
container.createScope():  void
```

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

## 📃 Inspiration

This project is inspired by [jeffijoe/awilix](https://github.com/jeffijoe/awilix) and builds upon its core concepts.
