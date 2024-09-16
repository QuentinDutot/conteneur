```js
import { createContainer, asFunction } from 'conteneur'

const createDataService = () => {
  const data = 'Hello world!'

  return {
    getData: () => data
  }
}

const createUserService = ({ dataService }) => {
  return {
    getUserData: () => dataService.getData()
  }
}

const container = createContainer()

container.register({
  dataService: asFunction(createDataService),
  userService: asFunction(createUserService),
})

const userService = container.resolve('userService')

console.log(userService.getUserData()) // Hello world!
```
