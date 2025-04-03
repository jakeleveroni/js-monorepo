import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'levdev-lab-docs',
    },
    tasks: {
      build: [['bun', 'run', 'build']],
    },
  }) satisfies BunrepoConfig;
