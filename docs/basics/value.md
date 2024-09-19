```js
import { createContainer } from 'conteneur'

const container = createContainer()

const getStringValue = () => 'Hello world!'
const getNumberValue = () => 123
const getBooleanValue = () => true
const getNullValue = () => null
const getUndefinedValue = () => undefined
const getObjectValue = () => ({ key: 'value' })
const getArrayValue = () => [1, 2, 3]

container.register({
  stringValue: [getStringValue],
  numberValue: [getNumberValue],
  booleanValue: [getBooleanValue],
  nullValue: [getNullValue],
  undefinedValue: [getUndefinedValue],
  objectValue: [getObjectValue],
  arrayValue: [getArrayValue],
})

const stringValue = container.resolve('stringValue')

console.log(stringValue) // Hello world!
```
