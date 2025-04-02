# Bun SSR React Playground

[Documentation](https://jakeleveroni.github.io/js-monorepo/projects/bun-ssr-react/)

An experiment in server side rendering. Specifically focused on breaking it down into a micro component frontend architecture.

## Development

Install dependencies

```sh
bun install
```

Start client

```sh
bun ws -w ssr -s dev:client
```

Start server

```sh
bun ws -w ssr -s dev:server
```

Open your browser to `http://localhost5177`