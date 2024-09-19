```js
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { createContainer } from 'conteneur'

const getConnectionString = () => 'localhost:1234'

const createMessageRepository = ({ connectionString }) => {
  console.log('Message repository constructed with connection string', connectionString)

  const findMessagesForUser = (userId) => {
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

const createMessageService = ({ currentUser, messageRepository }) => {
  console.log('creating message service, user ID: ', currentUser.id)

  return {
    findMessages: () => messageRepository.findMessagesForUser(currentUser.id)
  }
}

const app = new Koa()
const router = new KoaRouter()

const container = createContainer()

container.register({
  connectionString: [getConnectionString, { strategy: 'singleton' }],
  messageRepository: [createMessageRepository, { strategy: 'singleton' }],
  messageService: [createMessageService, { strategy: 'transient' }],
})

app.use((context, next) => {
  console.log('Registering scoped stuff')

  context.scope = container.createScope()
  context.scope.register({
    currentUser: [() => ({ id: context.request.query.userId })],
  })

  return next()
})

router.get('/messages', (context) => {
  const messageService = context.scope.resolve('messageService')
  return messageService.findMessages().then((messages) => {
    context.body = messages
    context.status = 200
  })
})

app.use(router.routes())
app.use(router.allowedMethods())

const PORT = 4321
app.listen(PORT, () => {
  console.log('Example running on port', PORT)
})
```
