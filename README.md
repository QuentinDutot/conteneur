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
  userService: asFunction(createUserService)
  userController: asFunction(createUserController),
})

const userController = container.resolve('userController')
```
