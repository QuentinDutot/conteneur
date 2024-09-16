```js
import { createContainer, asValue } from 'conteneur'

const container = createContainer()

container.register({
  stringValue: asValue('Hello world!'),
  numberValue: asValue(123),
  booleanValue: asValue(true),
  nullValue: asValue(null),
  undefinedValue: asValue(undefined),
  objectValue: asValue({ key: 'value' }),
  arrayValue: asValue([1, 2, 3]),
})

const stringValue = container.resolve('stringValue')

console.log(stringValue) // Hello world!
```
