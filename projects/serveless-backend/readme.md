# Serverless Backend

This is a serveless backend playground bult with Fermyon Spin and typescript. The typescript is compiled to wasm which is then wired up to a routes via itty-router. Fermyon provides the runtime and wasmruntime for the application to execute within.

**DISCLAIMER**: Unfortunately Fermyon is not playing nicely with bun. Because of this, this particular project uses Node & NPM still. Ill keep trying to get it working with Bun as its ecosystem matures.