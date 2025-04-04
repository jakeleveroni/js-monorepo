import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'threedee',
    },
    tasks: {
      pullrequest: [['bunx', 'tsc', '.']],
      prebuild: false,
      build: [['bun', 'run', 'build']],
      postbuild: false,
      finalize: false,
    },
  }) satisfies BunrepoConfig;
