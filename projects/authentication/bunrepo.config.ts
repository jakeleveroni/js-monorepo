import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'authentication',
    },
    tasks: {
      build: [['bun', 'run', 'build']],
    },
  }) satisfies BunrepoConfig;
