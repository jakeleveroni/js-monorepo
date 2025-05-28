import { setFailed, setOutput } from '@actions/core';
import {
  type BunfigLifecycleHook,
  type BunrepoConfig,
  type IndexedWorkspaces,
  getPackageJson,
} from '@ldlabs/utils';
import { file } from 'bun';
import { logger } from '../logger';
import type { WorkspaceWorkload } from '../types/workload';

const { error, info, log } = logger();
const VALID_TRIGGERS: Record<BunfigLifecycleHook, true> = {
  pullrequest: true,
  build: true,
  finalize: true,
  postbuild: true,
  prebuild: true,
};

type Args = {
  workspaces: string[];
  all: boolean;
  trigger: string;
};

export async function getTasks({ all, trigger, workspaces }: Args) {
  const errors: string[] = [];

  if (!trigger || !VALID_TRIGGERS[trigger as BunfigLifecycleHook]) {
    error(
      `No valid trigger provided. Valid options: ${Object.keys(VALID_TRIGGERS).join(
        ', ',
      )}. Received: ${trigger ?? 'undefined'}`,
    );
    if (process.env.CI) {
      setFailed('No lifecycle trigger provided.');
      return;
    }
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
    info('No workspaces provided, terminating early.');
    process.exit(-1);
  }

  const workspaceWorkloads: WorkspaceWorkload[] = [];

  for (const ws of includedWorkspaces) {
    try {
      await file(`${ws.cwd}/bunrepo.config.ts`).stat();
    } catch {
      info(`No bunrepo config file found for workspace: ${ws.name}`);
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
        workspaceWorkloads.push({
          name: `Run ${ws.name} Tasks`,
          cwd: ws.cwd,
          workspace: ws.name,
          tasks: wsTasks,
        });
      }
    } catch (err) {
      log(`Unable to resolve ${ws.name} config | error: ${err}`);
    }
  }

  // output for github CI, the matrix accepts an "include" parameter from a json object
  const tasksObject = JSON.stringify({ workloads: { include: workspaceWorkloads }, errors });
  info(`Task generation output: ${tasksObject}`);

  if (errors.length > 0) {
    error(`Task generation failed, errors: ${errors}`);
    if (process.env.CI) {
      setFailed(`Task generation failed, errors: ${errors}`);
    }
    return;
  }

  if (process.env.CI) {
    setOutput('tasks', { include: workspaceWorkloads });
  }
}
