```js
import { createContainer, asClass, asFunction } from 'conteneur'

class DataService {
  constructor() {
    this.data = 'Hello world!'
  }

  getData() {
    return this.data
  }
}

const createUserService = ({ dataService }) => {
  return {
    getUserData: () => dataService.getData()
  }
}

const container = createContainer()

container.register({
  dataService: asClass(DataService),
  userService: asFunction(createUserService),
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
