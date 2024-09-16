```js
import { createContainer, asClass } from 'conteneur'

class DataService {
  constructor() {
    this.data = 'Hello world!'
  }

  getData() {
    return this.data
  }
}

class UserService {
  constructor({ dataService }) {
    this.dataService = dataService
  }

  getUserData() {
    return this.dataService.getData()
  }
}

const container = createContainer()

container.register({
  dataService: asClass(DataService),
  userService: asClass(UserService),
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
