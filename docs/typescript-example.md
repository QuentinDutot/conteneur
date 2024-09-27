# TypeScript Example

## Setup

### Install Package

```shell
npm install conteneur
```

### Define Services

Functions are the preferred approach, classes and plain values should be wrapped within functions.

```ts
interface DataService {
  getData: () => string
}

const createDataService = (): DataService => {
  console.log('DataService created')

  return {
    getData: () => 'data from DataService'
  }
}
```

```ts
interface ReportService {
  getReport: () => string
}

const createReportService = ({ dataService }: { dataService: DataService }): ReportService => {
  console.log('ReportService created')

  return {
    getReport: () => `Report: ${dataService.getData()}`
  }
}
```

### Create Container

```ts
import { createContainer } from 'conteneur'

interface Container {
  dataService: DataService
  reportService: ReportService
}

const container = createContainer<Container>()

container.register({
  dataService: [createDataService],
  reportService: [createReportService],
  // singletonService: [createSingletonService, { strategy: 'singleton' }],
})
```

## Usage

### Resolve Registered Service

```ts
const reportService = container.resolve('reportService')

reportService.getReport() // Report: data from DataService
```

### Inject Unregistered Service

Services can get dependencies injected without being registered in the container.

```ts
const createCustomService = ({ dataService }: { dataService: DataService }) => ({
  customMethod: () => `Custom: ${dataService.getData()}`
})

const customService = container.inject(createCustomService)

customService.customMethod() // Custom: data from DataService
```

### Create Container Scope

Functions registered in a scope are only available in that scope.
Also, container services can be overridden by scope services.

```ts
interface ScopedService {
  scopedMethod: () => string
}

const createScopedService = ({ dataService }: { dataService: DataService }): ScopedService => ({
  scopedMethod: () => `Scoped: ${dataService.getData()}`
})

interface ContainerScope extends Container {
  scopedService: ScopedService
}

const containerScope = container.createScope<ContainerScope>()

containerScope.register({
  scopedService: [createScopedService]
})

const scopedService = containerScope.resolve('scopedService')

scopedService.scopedMethod() // Scoped: data from DataService
```
