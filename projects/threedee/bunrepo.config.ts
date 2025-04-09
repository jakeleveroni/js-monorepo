import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'threedee',
    },
    tasks: {
      pullrequest: [['bunx --bun biome format'], ['bunx --bun biome lint'], ['bun run build']],
      prebuild: false,
      build: [['bun run build']],
      postbuild: false,
      finalize: false,
    },
  }) satisfies BunrepoConfig;
