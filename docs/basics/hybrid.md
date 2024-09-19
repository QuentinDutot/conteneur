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

const createDataService = () => new DataService()

const createUserService = ({ dataService }) => {
  return {
    getUserData: () => dataService.getData()
  }
}

const container = createContainer()

container.register({
  dataService: [createDataService],
  userService: [createUserService],
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
