# JS Monrepo

This monorepo is a playground for my JS/TS based projects. I am going to be using it to build out custom monorepo tooling via Bun. I think Bun has huge potential as a great monorepo tool as it integrates so many disparate parts of the node ecosystem. Namely: native TS support, a built-in test runner, and the TS + ESM first design. I think Bun has the potential to eventually overtake node strictly due to its developer friendliness. 

## Bun Based Projects

**authentication**: A simple express JWT authentication server. I wanted to learn more about what an auth server actually does so i worked through a simple implementation. My plan is to continue developing it over time until its something i think i can user in other projects. 

**documentation**: my soon to exist docs outlining my work in this repo. Im hoping that this will be the final development environment i setup to contain any and all javascript related work i do in my personal time.

**three-fiber-site**: a playground for a 3D game built with react-three-fiber. I hope to make it into an actual playable example at some point.

**bun-ssr-react**: A proof of concept SSR setup for react using Buns built in http server. Not really sure what im making here im more exploring

## Node Based Projects

**serverless-backend**: A proof of concept rest api backend that runs in a serverless warm runtime called Fermyon Spin. I think it has potential to be a dynamic backend that i can modify quickly and easily, perfect for a hobbyist backend server.

For now the main focus is building out some more tooling around the monorepo. Its nice to have some sample apps in here for testing. I hope to continue working on both the projects and the monorepo tooling but its a lot honestly.


## THings To Do Still

- Im interested in replacing vite as the bundler with Buns experimental bundler. If i could reduce the tooling even further to just Bun that would be amazing.
- Monitor Bun's Node compat and continue to evaluate if i can move the Fermyon Spin serveless backend to Bun
- Build out redis deployment and express middleware to truly implement scalable jwt jti verification
- actually build out documentation site (lol)
- Explore the possibility of updating serverless backend to allow end users to upload wasm files to the server and register them on specific routes so users can build and define their own endpoints.
- Add mouse based camera controls to the three fiber game
- Build out a better game dev tooling setup for the three fiber game (gizmo utils setup on objects, UI research into how to do UI better in three fiber)
