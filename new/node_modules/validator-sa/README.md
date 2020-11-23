# validator-sa

Implements validation and normalization of strings, for South African ID
numbers. Maybe in future other validation that is specific to South Africa.

[Here](https://codesandbox.io/s/react-codesandbox-w4o49) is a usage
example inside a [React](https://reactjs.org/) component. You can test
and validate ID numbers there, with error feedback.

# How to Use

Install it via `npm`:

```
npm i validator-sa
```

In ES6, import what you need:

```
import { isValidSouthAfricanIDNumber } from 'validator-sa'
```

In ES5, `require` it, and use it form there:

```
var validator = require('validator-sa');

var isValid = validator.isValidSouthAfricanIDNumber('123')
// `isValid` should be false
```

# API

Documentation is [here](./api.md).

TODO: Not all functions are documented.