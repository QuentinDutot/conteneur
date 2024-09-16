```js
import { asClass, createContainer } from 'conteneur'

class DependentService {
  constructor(testService) {
    this.testService = testService
  }

  getInnerData() {
    return this.testService.getData()
  }
}

class TestService {
  constructor() {
    this.data = 'Hello world!'
  }

  getData() {
    return this.data
  }
}

const container = createContainer()

container.register({
  testService: asClass(TestService),
  dep: asClass(DependentService),
})

const depService = container.resolve('dep')

console.log(depService.getInnerData())
```
