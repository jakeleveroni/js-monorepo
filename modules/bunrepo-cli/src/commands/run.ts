import { endGroup, setFailed, startGroup } from '@actions/core';
import { logger } from '../logger';
import type { WorkspaceWorkload } from '../types/workload';

const { debug, error, log } = logger();

export function runWorkload(workload: string | WorkspaceWorkload, verbose = false) {
  if (verbose) {
    debug('Run workload input');
    debug(typeof workload === 'string' ? workload : JSON.stringify(workload));
  }

  let parsedWorkload: WorkspaceWorkload;
  if (typeof workload === 'string') {
    parsedWorkload = JSON.parse(workload) as WorkspaceWorkload;
  } else {
    parsedWorkload = workload;
  }

  if (!validateWorkload(parsedWorkload)) {
    error('Invalid workflow provided.');
    debug(JSON.stringify(parsedWorkload));
    return;
  }

  const errors: string[] = [];
  for (const cmd of parsedWorkload.tasks) {
    const cmdTitle = `(${parsedWorkload.workspace}) - Running "${cmd}"`;
    startGroup(cmdTitle);
    log(cmdTitle);

    const { success, stderr, exitCode } = Bun.spawnSync({
      cmd: [...cmd.split(' ')],
      cwd: parsedWorkload.cwd,
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    if (!success) {
      errors.push(
        `Task failed (${parsedWorkload.workspace}) - ${cmd}. Output: ${stderr} | exist code ${exitCode}`,
      );
    } else {
      log(`Completed task (${parsedWorkload.workspace}) - ${cmd}`);
    }

    endGroup();
  }

  if (errors.length > 0) {
    error('Workload execution failed');
    if (process.env.CI) {
      setFailed(new Error(JSON.stringify({ message: 'Workload execution failed.', errors })));
    }
    return;
  }

  log('Workload task execution completed successfully');
}

function validateWorkload(workload: WorkspaceWorkload) {
  if (!workload.cwd || !workload.workspace || workload.tasks?.length === 0) {
    console.error('Invalid workload configuration', JSON.stringify(workload, null, 2));
    return false;
  }

  return true;
}
