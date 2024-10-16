# YOllama Overview
A front-end library for accessing your locally or external Ollama API!

This library is used for quick connections either full or streamed to recieve responses from your local or external Ollama server.
This will add easy to use class based calls to communicate to GPTs on your Ollama server.


# Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)

## Installation
To install YOllama you must clone to github, and build the dist file if needed. At some point this library **will be publish to NPM**,
but currently we are deep in early development. You will need to manually require the index.js to get access to the library.

**ESM**
```ts
import YOllama as "../dist/index.js"
```

**CommonJS**
```js
const YOllama = require("../dist/index.js")
```

## Getting Started

To get started we're assuming you'll already have access to an Ollama server. For the entirety of the documentation we will be assuming
you are using a local Ollama server.

For getting started to access your Ollama server, you'll need to initialize a OInstance which you can import as **OInstance** under the main import class.

**ESM:**
```ts
import { OInstance } from "../dist/index.js"
```

**CommonJS**
```js
const { OInstance } = require("../dist/index.js")
```

When creating an instance of OInstance you'll do the following.

When using an external Ollama server or a server with a non-default host you'll need to provide the host when creating the OInstance.
```ts
const OInstance = new OInstance("http://your_ollama_api.com:PORT")
```
Domains, and IPs are supported when creating an instance.
Additionally there is a custom tag you can set to true which is debug which will add some simple logging QOL.
```ts
const OInstance = new OInstance("http://your_ollama_api.com:PORT", true)
```

There is a little neat feature. When you are using a normal default Ollama server on the normal port, and ip you can use
```ts
const OInstance = new OInstance()
```

This OInstance will be a core class in creating Ollama interaction classes.