import type { BunrepoConfig } from '../../bunrepo-config';

export default () =>
  ({
    meta: {
      name: 'bun-ssr-react',
    },
    tasks: {
      build: [['bun', 'run', 'build']],
    },
  }) satisfies BunrepoConfig;
