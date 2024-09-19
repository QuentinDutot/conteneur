```js
import { createContainer } from 'conteneur'

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

const createDataService = () => new DataService()
const createUserService = (deps) => new UserService(deps)

const container = createContainer()

container.register({
  dataService: [createDataService],
  userService: [createUserService],
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
