import { parseArgs } from 'util';
import type { Workload, WorkspaceWorkload } from '../types/workload';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    workloads: {
      type: 'string',
      short: 'w',
      multiple: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

await run();

async function run() {
  if (!values?.workloads) {
    console.error('No workload input detected');
    process.exit(-1);
  }

  const parsedWorkloads: Workload = JSON.parse(values.workloads);

  if (!parsedWorkloads || !parsedWorkloads.workloads?.length) {
    console.error(`Failed to parse workload input: ${parsedWorkloads}`);
    process.exit(-1);
  }

  for (const workload of parsedWorkloads.workloads) {
    const { isParallel } = workload;

    if (isParallel) {
      executeParallel(workload);
    } else {
      executeSynchronous(workload);
    }
  }
}

function executeSynchronous(workload: WorkspaceWorkload) {
  const { cwd, tasks, workspace } = workload;

  for (const task of tasks) {
    console.log(`(${workspace}) - Running "${task.cmd}"`);
    return Bun.spawn({
      cmd: [task.cmd],
      cwd,
      stdio: ['inherit', 'inherit', 'inherit'],
      onExit(subprocess, _exitCode, _signalCode, error) {
        if (error) {
          console.error(`Task failed (${workspace}) - ${task.cmd}. Output: ${error}`);
          return;
        }

        if (subprocess.stdout && subprocess.stdout instanceof ReadableStream) {
          const res = new Response(subprocess.stdout).text();
          console.log(`Completed task (${workspace}) - ${task.cmd}. Output: ${res}`);
        } else {
          console.log(`Completed task (${workspace}) - ${task.cmd}. Output: ${subprocess.stdout}`);
        }
      },
    });
  }
}

function executeParallel(workload: WorkspaceWorkload) {
  const procs: Promise<string>[] = [];
  const { cwd, tasks, workspace } = workload;

  for (const task of tasks) {
    console.log(`(${workspace}) - Running "${task.cmd}"`);
    procs.push(
      new Promise((resolve, reject) => {
        return Bun.spawn({
          cmd: [task.cmd],
          cwd,
          stdio: ['inherit', 'inherit', 'inherit'],
          onExit(subprocess, _exitCode, _signalCode, error) {
            if (error) {
              console.error(`Task failed (${workspace}) - ${task.cmd}. Output: ${error}`);
              reject(JSON.stringify(error));
              return;
            }

            if (subprocess.stdout && subprocess.stdout instanceof ReadableStream) {
              const res = new Response(subprocess.stdout).text();
              console.log(`Completed task (${workspace}) - ${task.cmd}. Output: ${res}`);
              resolve(res);
            } else {
              console.log(
                `Completed task (${workspace}) - ${task.cmd}. Output: ${subprocess.stdout}`,
              );
              resolve(JSON.stringify(subprocess.stdout));
            }
          },
        });
      }),
    );

    Promise.allSettled(procs);
  }
}
