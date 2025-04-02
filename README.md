# JS Monrepo

This monorepo is a playground for my JS/TS based projects. I am going to be using it to build out custom monorepo tooling via Bun. Bun has a huge potential to be a great monorepo tool as it integrates so many disparate parts of the modern javascript development ecosystem. Namely: native TS support, a built-in test runner, TS + ESM first design, built in dev server, and *experimental* bundling capabilities I think Bun has the potential to eventually overtake node strictly due to its developer friendliness.

[Monorepo Documentation](https://jakeleveroni.github.io/js-monorepo/repo/)
[Projects Documentation](https://jakeleveroni.github.io/js-monorepo/projects/)


## Bun Based Projects

**authentication**: A simple express JWT authentication server. I wanted to learn more about what an auth server actually does so i worked through a simple implementation. My plan is to continue developing it over time until its something i think i can user in other projects. 

[Docs Site](https://jakeleveroni.github.io/js-monorepo/projects/authentication/)

**documentation**: The astro documentation site for this repo and its various projects

**threedee**: a playground for a 3D game built with react-three-fiber. I hope to make it into an actual playable example at some point.

[Docs Site](https://jakeleveroni.github.io/js-monorepo/projects/three-fiber-site/)


**bun-ssr-react**: A proof of concept SSR setup for react using Buns built in http server. Not really sure what im making here im more exploring

[Docs Site](https://jakeleveroni.github.io/js-monorepo/projects/three-fiber-site/)

## Node Based Projects

**serverless-backend**: A proof of concept rest api backend that runs in a serverless warm runtime called Fermyon Spin. I think it has potential to be a dynamic backend that i can modify quickly and easily, perfect for a hobbyist backend server.

[Docs Site](https://jakeleveroni.github.io/js-monorepo/projects/serverless-backend/)


## Future Plans

For now I'm prioritizing monorepo tooling as needs arise. Otherwise im tinkering in one of the projects.

- Im interested in replacing vite as the bundler with Buns experimental bundler. If i could reduce the tooling even further to just Bun that would be amazing.
- Monitor Bun's Node compat and continue to evaluate if i can move the Fermyon Spin serveless backend to Bun
- Build out redis deployment and express middleware to truly implement scalable jwt jti verification
- actually build out documentation site (lol)
- Explore the possibility of updating serverless backend to allow end users to upload wasm files to the server and register them on specific routes so users can build and define their own endpoints.
- Add mouse based camera controls to the three fiber game
- Build out a better game dev tooling setup for the three fiber game (gizmo utils setup on objects, UI research into how to do UI better in three fiber)
