# YOllama Overview
A front-end library for accessing your locally or external Ollama API!

This library is used for quick connections either full or streamed to receive responses from your local or external Ollama server.
This will add easy to use class based calls to communicate to GPTs on your Ollama server.

**Note:** A considerable amount of Examples only have a TypeScript example. But this library has been tested to work with CommonJS.

# Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [OInstance](#oinstance)
  - [ContextClass](#contextclass)

## Installation
To install YOllama you must clone to github, and build the dist file if needed. At some point this library **will be published to NPM**,
but currently we are deep in early development. You will need to manually require the index.js to get access to the library.

**ESM**
```ts
import YOllama from "../dist/index.js"
```

**CommonJS**
```js
const YOllama = require("../dist/index.js")
```

## Getting Started

### OInstance

To get started we're assuming you'll already have access to an Ollama server. For the entirety of the documentation we will be assuming
you are using a local Ollama server.

For getting started to access your Ollama server, you'll need to initialize an OInstance which you can import as **OInstance** under the main import class.

**ESM:**
```ts
import { OInstance } from "../dist/index.js"
```

**CommonJS**
```js
const { OInstance } = require("../dist/index.js")
```

When creating an instance of OInstance you'll do the following:

When using an external Ollama server or a server with a non-default host you'll need to provide the host when creating the OInstance.
```ts
const ollama = new OInstance("http://your_ollama_api.com:PORT")
```
Domains, and IPs are supported when creating an instance.
Additionally there is a custom tag you can set to true which is debug which will add some simple logging QOL.
```ts
const ollama = new OInstance("http://your_ollama_api.com:PORT", true)
```

There is a neat feature. When you are using a normal default Ollama server on the normal port and IP you can use:
```ts
const ollama = new OInstance()
```

This OInstance will be a core class in creating Ollama interaction classes.

### ContextClass

The ContextClass is used for making single context API calls to your Ollama server. It provides methods for generating text and JSON responses, as well as converting text to JSON and JSON to JSON.

To use the ContextClass, first import it and create an instance:

```ts
import { ContextClass } from "../dist/index.js"

const context = new ContextClass(ollama, true) // The second parameter enables debug mode
```

The ContextClass provides the following main methods:

1. `generateTextResponse`: Generates a text response based on a given request.
2. `generateT2J`: Converts text input into a JSON structure.
3. `generateJ2J`: Generates a JSON response based on a provided JSON input.
4. `generateFileTextResponse`: Generates a text response based on the given request, including support for images and files.

Each of these methods supports both streaming and non-streaming modes. Here's how to use them:

#### Text Response Generation

```ts
// Non-streaming
const response = await context.generateTextResponse("model_id", "Your request here")
console.log(response)

// Streaming
await context.generateTextResponse("model_id", "Your request here", true, (token) => {
    process.stdout.write(token) // This will print each token as it's received
})
```

#### Text to JSON Conversion

```ts
// Non-streaming
const jsonResponse = await context.generateT2J("model_id", "Convert this text to JSON")
console.log(jsonResponse)

// Streaming
await context.generateT2J("model_id", "Convert this text to JSON", true, (token) => {
    process.stdout.write(token) // This will print each token as it's received
})
```

#### JSON to JSON Generation

```ts
// Non-streaming
const inputJson = { key: "value" }
const jsonResponse = await context.generateJ2J("model_id", inputJson)
console.log(jsonResponse)

// Streaming
await context.generateJ2J("model_id", inputJson, true, (token) => {
    process.stdout.write(token) // This will print each token as it's received
})
```

#### File and Image Support

The `generateFileTextResponse` method allows you to include files (including images) in your request:

```ts
const files = [/* array of File objects */]
const response = await context.generateFileTextResponse("model_id", "Describe these images", {
    files: files,
    stream: true,
    onToken: (token) => {
        process.stdout.write(token)
    }
})
```

Remember to use a model that supports multimodal inputs when including images in your request.

These methods provide flexible ways to interact with your Ollama server, allowing for both streamed and non-streamed responses, as well as various input and output formats.