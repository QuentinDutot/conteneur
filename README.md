# Conteneur

[![npm](https://img.shields.io/npm/v/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![CI](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml/badge.svg)](https://github.com/bouclier-dev/conteneur/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/dt/conteneur.svg?maxAge=1000)](https://www.npmjs.com/package/conteneur)
[![npm](https://img.shields.io/npm/l/conteneur.svg?maxAge=1000)](https://github.com/bouclier-dev/conteneur/blob/master/LICENSE.md)

Extremely powerful, performant, & battle-tested **Dependency Injection** (DI) container for JavaScript/Node,
written in [TypeScript](http://typescriptlang.org).

Conteneur enables you to write **composable, testable software** using dependency injection **without special annotations**, which in turn decouples your core application code from the intricacies of the DI mechanism.

# Table of Contents

- [Conteneur](#conteneur)
- [Table of Contents](#table-of-contents)
- [Usage](#usage)
- [Lifetime management](#lifetime-management)
  - [Scoped lifetime](#scoped-lifetime)
- [Inlining resolver options](#inlining-resolver-options)
- [API](#api)
  - [The `conteneur` object](#the-conteneur-object)
  - [Resolver options](#resolver-options)
  - [`createContainer()`](#createcontainer)
  - [`asFunction()`](#asfunction)
  - [`asClass()`](#asclass)
  - [`asValue()`](#asvalue)
  - [The `Container` object](#the-container-object)
    - [`container.register()`](#containerregister)
    - [`container.resolve()`](#containerresolve)
    - [`container.createScope()`](#containercreatescope)
    - [`container.build()`](#containerbuild)

# Usage

Conteneur has a pretty simple API (but with many possible ways to invoke it). At
minimum, you need to do 3 things:

- Create a container
- Register some modules in it
- Resolve and use!

```js
import { createContainer, asClass, asFunction, asValue } from 'conteneur'

const container = createContainer()

class UserController {
  constructor(deps) {
    this.userService = deps.userService
  }

  getUser(context) {
    return this.userService.getUser(ctx.params.id)
  }
}

container.register({ userController: asClass(UserController) })

const createUserService = ({ db }) => {
  return {
    getUser: (id) => {
      return db.query(`select * from users where id=${id}`)
    },
  }
}

container.register({ userService: asFunction(createUserService) })

const createDatabase = ({ connectionString, timeout }) => {
  this.conn = connectToYourDatabaseSomehow(connectionString, timeout)

  return {
    query: (sql) => {
      return this.conn.rawSql(sql)
    }
  }
}

container.register({ db: asClass(createDatabase) })

container.register({
  connectionString: asValue(process.env.CONN_STR),
  timeout: asValue(1000),
})

router.get('/api/users/:id', container.resolve('userController').getUser)
```

That example is rather lengthy, but if you extract things to their proper files
it becomes more manageable.

[Check out a working Koa example!](/examples/koa)

# Lifetime management

Control whether objects are resolved and used once, cached within a certain
scope, or cached for the lifetime of the process.

There are 3 lifetime types available.

- `transient`: This is the default. The registration is resolved every
  time it is needed. This means if you resolve a class more than once, you will
  get back a new instance every time.
- `scoped`: The registration is scoped to the container - that means
  that the resolved value will be reused when resolved from the same scope (or a
  child scope).
- `singleton`: The registration is always reused no matter what - that
  means that the resolved value is cached in the root container.

To register a module with a specific lifetime:

```js
import { asClass, asFunction, asValue } from 'conteneur'

class MailService {}

container.register({
  mailService: asClass(MailService, { lifetime: 'singleton' }),
})
```

## Scoped lifetime

In web applications, managing state without depending too much on the web
framework can get difficult. Having to pass tons of information into every
function just to make the right choices based on the authenticated user.

Scoped lifetime in Conteneur makes this simple - and fun!

```js
const { createContainer, asClass, asValue } = conteneur
const container = createContainer()

class MessageService {
  constructor({ currentUser }) {
    this.user = currentUser
  }

  getMessages() {
    const id = this.user.id
    // wee!
  }
}

container.register({
  messageService: asClass(MessageService, { lifetime: 'scoped' }),
})

// imagine middleware in some web framework..
app.use((req, res, next) => {
  // create a scoped container
  req.scope = container.createScope()

  // register some request-specific data..
  req.scope.register({
    currentUser: asValue(req.user),
  })

  next()
})

app.get('/messages', (req, res) => {
  // for each request we get a new message service!
  const messageService = req.scope.resolve('messageService')
  messageService.getMessages().then((messages) => {
    res.send(200, messages)
  })
})

// The message service can now be tested
// without depending on any request data!
```

**IMPORTANT!** If a singleton is resolved, and it depends on a scoped or
transient registration, those will remain in the singleton for its lifetime!
Similarly, if a scoped module is resolved, and it depends on a transient
registration, that remains in the scoped module for its lifetime.
In the example above, if `messageService` was a singleton, it would be cached
in the root container, and would always have the `currentUser` from the first
request. Modules should generally not have a longer lifetime than their
dependencies, as this can cause issues of stale data.

```js
const makePrintTime =
  ({ time }) =>
  () => {
    console.log('Time:', time)
  }

const getTime = () => new Date().toString()

container.register({
  printTime: asFunction(makePrintTime, { lifetime: 'singleton' }),
  time: asFunction(getTime, { lifetime: 'transient' }),
})

// Resolving `time` 2 times will
// invoke `getTime` 2 times.
container.resolve('time')
container.resolve('time')

// These will print the same timestamp at all times,
// because `printTime` is singleton and
// `getTime` was invoked when making the singleton.
container.resolve('printTime')()
container.resolve('printTime')()
```

This will trigger
the following error at runtime when the singleton `printTime` is resolved:
`Could not resolve 'time'. Dependency 'time' has a shorter lifetime than its ancestor: 'printTime'`

Read the documentation for [`container.createScope()`](#containercreatescope)
for more examples.

# API

## The `conteneur` object

When importing `conteneur`, you get the following top-level API:

- `createContainer`
- `asValue`
- `asFunction`
- `asClass`

## Resolver options

Whenever you see a place where you can pass in **resolver options**, you can
pass in an object with the following props:

- `lifetime`: `transient` or `singleton` or `scoped`
- `isLeakSafe`: true if this resolver should be excluded from lifetime-leak checking. Defaults to false.

## `createContainer()`

Creates a new Conteneur container. The container stuff is documented further down.

## `asFunction()`

Used with `container.register({ userService: asFunction(makeUserService) })`.
Tells Conteneur to invoke the function without any context.

The returned resolver has the following chainable (fluid) API:

- `asFunction(factory, { lifetime: 'transient' })`
- `asFunction(factory, { lifetime: 'singleton' })`
- `asFunction(factory, { lifetime: 'scoped' })`

## `asClass()`

Used with `container.register({ userService: asClass(UserService) })`. Tells
Conteneur to instantiate the given function as a class using `new`.

The returned resolver has the same chainable API as [`asFunction`](#asfunction).

## `asValue()`

Used with `container.register({ dbHost: asValue('localhost') })`. Tells Conteneur
to provide the given value as-is.

## The `Container` object

The container returned from `createContainer` has some methods and properties.

### `container.resolve()`

Resolves the registration with the given name. Used by the cradle.

**Signature**

- `resolve<T>(name: string): T`

```js
container.register({
  leet: asFunction(() => 1337),
})

container.resolve('leet') === 1337
```

### `container.register()`

**Signatures**

- `register(name: string, resolver: Resolver): Container`
- `register(nameAndResolverPair: NameAndResolverPair): Container`

Conteneur needs to know how to resolve the modules, so let's pull out the resolver
functions:

```js
import { asValue, asFunction, asClass } from 'conteneur'
```

- `asValue`: Resolves the given value as-is.
- `asFunction`: Resolve by invoking the function with the container cradle as
  the first and only argument.
- `asClass`: Like `asFunction` but uses `new`.

Now we need to use them. There are multiple syntaxes for the `register`
function, pick the one you like the most - or use all of them, I don't really
care! :sunglasses:

**Both styles supports chaining! `register` returns the container!**

```js
// name-resolver
container.register('connectionString', asValue('localhost:1433;user=...'))
container.register('mailService', asFunction(makeMailService))
container.register('context', asClass(SessionContext))

// object
container.register({
  connectionString: asValue('localhost:1433;user=...'),
  mailService: asFunction(makeMailService, { lifetime: 'singleton' }),
  context: asClass(SessionContext, { lifetime: 'scoped' }),
})

// `asClass` and `asFunction` also supports a fluid syntax.
container.register('mailService', asFunction(makeMailService, { lifetime: 'singleton' }))
container.register('context', asClass(SessionContext, { lifetime: 'singleton' }))

// here are the other `lifetime` variants as fluid functions.
container.register('context', asClass(SessionContext, { lifetime: 'transient' }))
container.register('context', asClass(SessionContext, { lifetime: 'scoped' }))
```

**The object syntax, key-value syntax and chaining are valid for all `register`
calls!**

### `container.createScope()`

Creates a new scope. All registrations with a `scoped` lifetime will be cached
inside a scope. A scope is basically a "child" container.

- returns `Container`

```js
// Increments the counter every time it is resolved.
let counter = 1
container.register({
  counterValue: asFunction(() => counter++, { lifetime: 'scoped' }),
})
const scope1 = container.createScope()
const scope2 = container.createScope()

const scope1Child = scope1.createScope()

scope1.resolve('counterValue') === 1
scope1.resolve('counterValue') === 1
scope2.resolve('counterValue') === 2
scope2.resolve('counterValue') === 2

scope1Child.resolve('counterValue') === 3
```

A _Scope_ maintains it's own cache of `scoped` lifetime registrations, meaning it **does not use the parent's cache** for scoped registrations.

```js
let counter = 1
container.register({
  counterValue: asFunction(() => counter++, { lifetime: 'scoped' }),
})
const scope1 = container.createScope()
const scope2 = container.createScope()

// The root container is also a scope.
container.resolve('counterValue') === 1
container.resolve('counterValue') === 1

// This scope resolves and caches it's own.
scope1.resolve('counterValue') === 2
scope1.resolve('counterValue') === 2

// This scope resolves and caches it's own.
scope2.resolve('counterValue') === 3
scope2.resolve('counterValue') === 3
```

A scope may also register additional stuff - they will only be available within
that scope and it's children.

```js
// Register a transient function
// that returns the value of the scope-provided dependency.
// For this example we could also use scoped lifetime.
container.register({
  scopedValue: asFunction((cradle) => 'Hello ' + cradle.someValue),
})

// Create a scope and register a value.
const scope = container.createScope()
scope.register({
  someValue: asValue('scope'),
})

scope.resolve('scopedValue') === 'Hello scope'
container.resolve('someValue')
// throws ConteneurResolutionException
// because the root container does not know
// of the resolver.
```

Things registered in the scope take precedence over registrations in the parent scope(s). This
applies to both the registration directly requested from the scope container, and any dependencies
that the registration uses.

```js
// It does not matter when the scope is created,
// it will still have anything that is registered
// in its parent.
const scope = container.createScope()

container.register({
  value: asValue('root'),
  usedValue: asFunction((cradle) => `hello from ${cradle.value}`),
})

scope.register({
  value: asValue('scope'),
})

container.resolve('value') === 'root'
scope.resolve('value') === 'scope'
container.resolve('usedValue') === 'hello from root'
scope.resolve('usedValue') === 'hello from scope'
```

Registering singletons in a scope is not possible. Having
more than one singleton with the same name in different scopes would result in them sharing a cache
entry and colliding with each other.

### `container.build()`

Builds an instance of a class or a function by injecting dependencies, but
without registering it in the container.

Args:

- `target`: A class or a function
- `options`: Resolver options.

Returns an instance of whatever is passed in, or the result of calling the
resolver.

```js
class MyClass {
  constructor({ ping }) {
    this.ping = ping
  }

  pong() {
    return this.ping
  }
}

const createMyFunc = ({ ping }) => ({
  pong: () => ping,
})

container.register({
  ping: asValue('pong'),
})

const myClass = container.build(MyClass)
const myFunc = container.build(createMyFunc)
```
