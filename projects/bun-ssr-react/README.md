# Bun SSR React Playground

An experiment running a bun SSR react server. Mainly an opportunity to get a better understanding of ssr concepts and how it works with react and jsx specifically.

Starting the project locally

```sh
bun run dev:server
```

Then you can access the application on http://localhost:5177 (currently there is only a `/weather-info route`)

I dont have hot reload working entirely yet, if you want partial hot reloading you can run `bun run dev:client` as well which will rebuild the client code when you make changes to client code. It should appear in the browser after a reload at that point.
