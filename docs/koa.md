```js
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { createContainer, asValue, asFunction, asClass, Lifetime } from 'conteneur'

function makeMessageRepository({ DB_CONNECTION_STRING }) {
  // Imagine using the connection string for something useful..
  console.log('Message repository constructed with connection string', DB_CONNECTION_STRING)

  function findMessagesForUser(userId) {
    return Promise.resolve({
      1: [
        { message: 'hello' },
        { message: 'world' },
      ],
      2: [
        { message: 'damn son' },
      ]
    }[userId])
  }

  return { findMessagesForUser }
}

class MessageService {
  constructor({ currentUser, messageRepository }) {
    console.log('creating message service, user ID: ', currentUser.id)
    this.currentUser = currentUser
    this.messages = messageRepository
  }

  findMessages() {
    return this.messages.findMessagesForUser(this.currentUser.id)
  }
}

const app = new Koa()
const router = new KoaRouter()

const container = createContainer()

container.register({
  // used by the repository; registered.
  DB_CONNECTION_STRING: asValue('localhost:1234', { lifetime: 'singleton' }),
  // resolved for each request.
  messageService: asClass(MessageService, { lifetime: 'scoped' }),
  // only resolved once
  messageRepository: asFunction(makeMessageRepository, { lifetime: 'singleton' }),
})

// For each request we want a custom scope.
app.use((ctx, next) => {
  console.log('Registering scoped stuff')
  ctx.scope = container.createScope()
  // based on the query string, let's make a user..
  ctx.scope.register({
    // This is where you'd use something like Passport,
    // and retrieve the req.user or something.
    currentUser: asValue({
      id: ctx.request.query.userId,
    }),
  })

  return next()
})

router.get('/messages', (ctx) => {
  // Use the scope to resolve the message service.
  const messageService = ctx.scope.resolve('messageService')
  return messageService.findMessages().then((messages) => {
    ctx.body = messages
    ctx.status = 200
  })
})

app.use(router.routes())
app.use(router.allowedMethods())

const PORT = 4321
app.listen(PORT, () => {
  console.log('Example running on port', PORT)
})
```
