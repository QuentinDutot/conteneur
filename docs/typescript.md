```js
import { createContainer } from 'conteneur'

interface DataService {
  getData: () => string
}

const createDataService = (): DataService => {
  const data = 'Hello world!'

  return {
    getData: () => data
  }
}

interface UserService {
  getUserData: () => string
}

const createUserService = ({ dataService }: { dataService: DataService }): UserService => {
  return {
    getUserData: () => dataService.getData()
  }
}

interface Container {
  dataService: DataService
  userService: UserService
}

const container = createContainer<Container>()

container.register({
  dataService: [createDataService],
  userService: [createUserService],
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
