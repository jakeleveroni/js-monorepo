import {
  type BunfigLifecycleHook,
  type BunrepoConfig,
  type IndexedWorkspaces,
  getPackageJson,
} from '@ldlabs/utils';
import { file } from 'bun';
import type { Task, Workload } from '../types/workload';

const VALID_TRIGGERS: Record<BunfigLifecycleHook, true> = {
  pullrequest: true,
  build: true,
  finalize: true,
  postbuild: true,
  prebuild: true,
};

type Args = {
  workspaces: string[];
  passthroughs: string[];
  all: boolean;
  trigger: string;
  log: boolean;
};

export async function getTasks({ all, log, trigger, workspaces, passthroughs }: Args) {
  const errors: string[] = [];

  if (!trigger || !VALID_TRIGGERS[trigger as BunfigLifecycleHook]) {
    console.error(
      `No valid trigger provided. Valid options: ${Object.keys(VALID_TRIGGERS).join(
        ', ',
      )}. Received: ${trigger ?? 'undefined'}`,
    );
    process.exit(-1);
  }

  const rootPkgJson = await getPackageJson();

  let includedWorkspaces: IndexedWorkspaces;

  if (all) {
    includedWorkspaces = rootPkgJson.indexedWorkspaces ?? [];
  } else {
    includedWorkspaces =
      rootPkgJson.indexedWorkspaces?.filter((ws) =>
        workspaces?.some((w) => ws.aliases.includes(w)),
      ) ?? [];
  }

  if (workspaces?.length === 0) {
    if (log) {
      console.warn('No workspaces provided, terminating early.');
    }
    process.exit(-1);
  }

  const workload: Workload = {
    workloads: [],
  };

  for (const ws of includedWorkspaces) {
    try {
      await file(`${ws.cwd}/bunrepo.config.ts`).stat();
    } catch {
      if (log) {
        console.warn(`No bunrepo config file found for workspace: ${ws.name}`);
      }
      continue;
    }

    const wsConfigModule = (await import(`${ws.cwd}/bunrepo.config.ts`)).default;
    try {
      const resolvedConfig = wsConfigModule() as BunrepoConfig;

      if (!resolvedConfig || !resolvedConfig.tasks) {
        throw new Error('Invalid bunrepo config format.');
      }

      const wsTasks = resolvedConfig.tasks[trigger as keyof BunrepoConfig['tasks']];

      if (wsTasks) {
        workload.workloads.push({
          cwd: ws.cwd,
          isParallel: false, // TODO make this configurable
          workspace: ws.name,
          tasks: wsTasks.map((cmd) => {
            return {
              name: `(${ws.name}) - ${cmd}`,
              cmd: cmd.join(' '),
              passthroughs,
              argv: [], // TODO idk if we need this
            } satisfies Task;
          }),
        });
      }
    } catch (err) {
      if (log) {
        console.log(`Unable to resolve ${ws.name} config`, err);
      }
    }
  }

  console.log(JSON.stringify({ workload, errors }));
}
