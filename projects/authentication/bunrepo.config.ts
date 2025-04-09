import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'authentication',
    },
    tasks: {
      pullrequest: [
        ['bunx', 'biome', 'format'],
        ['biome', 'lint'],
        ['bun', 'run', 'build'],
      ],
      prebuild: false,
      build: [['bun', 'run', 'build']],
      postbuild: false,
      finalize: false,
    },
  }) satisfies BunrepoConfig;
