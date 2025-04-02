# Serverless Backend

[Documentation](https://jakeleveroni.github.io/js-monorepo/projects/serverless-backend/)

This project is a serverless wasm backend experiment built with Fermyon Spin. I just came across <a href="https://developer.fermyon.com/spin/v3/" target="_blank">Fermyon Spin</a> via an LLM suggestion for self hosted serveless backend tools.

Fermyon Spin enables you to write serverless backends in any WASM compatible language you want. Im did an initial test with Typescript but im looking forward to learning some Assembly script as think ultimately it will feel more natural when compiling to WASM. 

## Development

### Requirements: 

<a href="https://nodejs.org/en/download">Node</a> (version 22 or later)

<a href="https://developer.fermyon.com/spin/v3/install" target="_blank">Spin CLI</a>


### Setup & Build

I couldnt get the Spin SDK to work with Bun so this project uses node for now. 

Install dependencies

```sh
npm install
```

### Start Backend

Build the project. This will produce the WASM & WASI output for the serverless backend process. There should be a /build and /dist folder now. The combiled WASM method is referenced in the spin.toml to register the server base route.

```sh
spin build
```

Start the backend 

```sh
spin up
```

The application should be live on `http://localhost:3000`