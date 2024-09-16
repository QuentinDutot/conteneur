```js
import { createContainer, asValue } from 'conteneur'

class TestService {
  data: string

  constructor() {
    this.data = 'Hello world!'
  }

  getData(): string {
    return this.data
  }
}

class DependentService {
  testService: TestService

  constructor(testService: TestService) {
    this.testService = testService
  }

  getInnerData(): string {
    return this.testService.getData()
  }
}

interface ICradle {
  testService: TestService
  depService: DependentService
}

const container = createContainer<ICradle>()

container.register({
  testService: asClass(TestService),
  depService: asClass(DependentService),
})

const dep1 = container.resolve<DependentService>('depService')
const dep2 = container.resolve<DependentService>('depService')

// Test that all is well, should produce 'Hello world!'
console.log(dep1.getInnerData())
console.log(dep2.getInnerData())
```
