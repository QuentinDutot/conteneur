# ConteneurJS

[![npm](https://img.shields.io/npm/v/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![npm](https://img.shields.io/npm/dt/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![CI](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml/badge.svg)](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml)

Conteneur is an **Inversion of Control** container for **Dependency Injection** using **Factory Functions**.

It supports **Scoped Containers**, **Transient and Singleton Strategies**, and **Cyclic Dependency Detection**.

- 🪶 0.9KB minified
- 🧩 Zero dependencies
- 📦 TypeScript and ESM
- 🧪 100% Test Coverage
- 🌐 Runtime Agnostic (Browser, Node, Deno, Bun, AWS, Vercel, Cloudflare, ..)

## 🚀 Usage

```js
import { createContainer } from 'conteneur'

const createDataService = () => ({
  getData: () => 'data from DataService'
})

const createReportService = ({ dataService }) => ({
  getReport: () => `Report generated with: ${dataService.getData()}`
})

const container = createContainer<Container>()

container.register({
  dataService: [createDataService],
  reportService: [createReportService],
})

const reportService = container.resolve('reportService')

reportService.getReport() // Report generated with: data from DataService
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
container.inject<T>(target: FunctionFactory<T>): T
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

## 📊 Comparisons
|                     | ConteneurJS | InversifyJS | TSyringe  | TypeDI   | Awilix    |
|---------------------|-------------|-------------|-----------|----------|-----------|
| TS + ESM + Tests    | ✅          | ✅          | ✅        | ✅       | ✅        |
| Dependency Count    | 🥇 0        | 🥈 1        | 🥈 1      | 🥇 0     | 🥉 2      |
| Runtime Agnostic    | ✅          | ❌          | ❌        | ❌       | ❌        |
| Function Support    | ✅          | ❌          | ❌        | ❌       | ✅        |
| Class Support       | ✅          | ✅          | ✅        | ✅       | ✅        |
| Value Support       | ✅          | ❌          | ❌        | ❌       | ✅        |
| Decorator Free      | ✅          | ❌          | ❌        | ❌       | ✅        |
| Lifetime Management | ✅          | ✅          | ✅        | ✅       | ✅        |
| Scoped Container    | ✅          | ✅          | ✅        | ❌       | ✅        |
| Size (min)          | 🥇 0.9kb    | ➖ 49.9kb   | ➖ 15.6kb | 🥈 9.5kb | 🥉 12.5kb |
| Size (min + gzip)   | 🥇 0.5kb    | ➖ 11.1kb   | ➖ 4.7kb  | 🥈 2.7kb | 🥉 4.6kb  |

## 📃 Inspiration

This project is inspired by [jeffijoe/awilix](https://github.com/jeffijoe/awilix) and builds upon its core concepts.
